#!/usr/bin/env bash
# Queries OSM for residential buildings in the West Campus dropoff zone.
# Usage: bash find-residential.sh
#
# Output (stdout):
#   UPDATED  — existing dropoff entries with refreshed OSM lat/lon/address
#   NEW      — OSM buildings not yet in the dropoff list
#   NOT FOUND — current entries with no OSM match (review for deletion)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

python3 - "$SCRIPT_DIR" <<'PYTHON'
import sys, re, json, math, os

script_dir = sys.argv[1]

# ── 1. Parse dropoffBoundaryPolygons ─────────────────────────────────────────
boundary_src = open(os.path.join(script_dir, 'src/utils/boundary-info.ts')).read()
section = boundary_src[boundary_src.index('dropoffBoundaryPolygons'):]
raw = re.findall(r'\{ latitude: ([\d.-]+), longitude: ([\d.-]+) \}', section)
polygon = [(float(lat), float(lon)) for lat, lon in raw]
min_lat = min(p[0] for p in polygon)
max_lat = max(p[0] for p in polygon)
min_lon = min(p[1] for p in polygon)
max_lon = max(p[1] for p in polygon)
sys.stderr.write(f'Parsed {len(polygon)} boundary points '
                 f'(bbox {min_lat:.4f},{min_lon:.4f} → {max_lat:.4f},{max_lon:.4f}).\n')

# ── 2. Parse existing housing locations ──────────────────────────────────────
dropoff_src = open(os.path.join(script_dir, 'src/utils/locations/dropoff-locations.tsx')).read()
loc_pat = re.compile(
    r'\{\s*id:\s*(\d+),\s*abbreviation:\s*"([^"]*)",\s*name:\s*"([^"]*)",\s*'
    r'address:\s*"([^"]*)",\s*lat:\s*([\d.-]+),\s*lon:\s*([\d.-]+),\s*category:\s*"housing"'
)
existing = []
for m in loc_pat.finditer(dropoff_src):
    existing.append({
        'id': int(m.group(1)), 'abbreviation': m.group(2), 'name': m.group(3),
        'address': m.group(4), 'lat': float(m.group(5)), 'lon': float(m.group(6)),
    })
sys.stderr.write(f'Loaded {len(existing)} existing housing locations.\n')

# ── 3. Point-in-polygon (ray casting) ────────────────────────────────────────
def in_polygon(lat, lon):
    inside = False
    j = len(polygon) - 1
    for i, (xi, yi) in enumerate(polygon):
        xj, yj = polygon[j]
        if (yi > lon) != (yj > lon) and lat < (xj - xi) * (lon - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside

# ── 4. Query Overpass API ─────────────────────────────────────────────────────
import subprocess

bbox = f'{min_lat},{min_lon},{max_lat},{max_lon}'
types = ['residential', 'apartments', 'dormitory', 'house', 'detached', 'semidetached_house']
way_stmts = ''.join(f'way["building"="{t}"]({bbox});' for t in types)
rel_stmts = ''.join(f'relation["building"="{t}"]({bbox});' for t in types)
query = f'[out:json][timeout:25];({way_stmts}{rel_stmts});out center tags;'

import time

ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
]

def run_query(query):
    for attempt, endpoint in enumerate(ENDPOINTS * 2, 1):
        sys.stderr.write(f'Querying {endpoint} (attempt {attempt})...\n')
        proc = subprocess.run(
            ['curl', '-s', '-w', '\n%{http_code}', '--data-urlencode', f'data={query}', endpoint],
            capture_output=True, text=True, timeout=45,
        )
        if proc.returncode != 0:
            sys.stderr.write(f'  curl error: {proc.stderr.strip()}\n')
            continue
        lines = proc.stdout.rsplit('\n', 1)
        body, status = (lines[0], lines[1].strip()) if len(lines) == 2 else (proc.stdout, '0')
        if status == '200' and body.strip():
            try:
                data = json.loads(body)
                if 'elements' in data:
                    return data['elements']
            except json.JSONDecodeError:
                pass
        sys.stderr.write(f'  HTTP {status} — waiting 15s before retry...\n')
        time.sleep(15)
    sys.exit('All Overpass endpoints failed. Try again later.')

elements = run_query(query)
sys.stderr.write(f'Overpass returned {len(elements)} elements in bbox.\n')

# ── 5. Build OSM building list (polygon-filtered) ─────────────────────────────
def build_address(tags):
    num    = tags.get('addr:housenumber', '')
    street = tags.get('addr:street', '')
    city   = tags.get('addr:city', 'Austin')
    state  = tags.get('addr:state', 'TX')
    post   = tags.get('addr:postcode', '')
    street_part = f'{num} {street}'.strip() if num and street else street
    return ', '.join(p for p in [street_part, city, state, post] if p)

osm_buildings = []
for el in elements:
    center = el.get('center', {})
    lat = center.get('lat') or el.get('lat')
    lon = center.get('lon') or el.get('lon')
    if lat is None or lon is None:
        continue
    if not in_polygon(lat, lon):
        continue
    tags = el.get('tags', {})
    osm_buildings.append({
        'osm_id': el['id'], 'name': tags.get('name', ''),
        'address': build_address(tags), 'lat': lat, 'lon': lon,
    })
sys.stderr.write(f'{len(osm_buildings)} buildings inside dropoff polygon.\n\n')

# ── 6. Cross-reference ────────────────────────────────────────────────────────
THRESHOLD = 0.0005  # ~55 m in degree units

def nearby(a, b):
    return math.sqrt((a['lat'] - b['lat'])**2 + (a['lon'] - b['lon'])**2) < THRESHOLD

matched_ids = set()
updated, new_locs = [], []
for b in osm_buildings:
    hit = next((e for e in existing if nearby(b, e)), None)
    if hit:
        matched_ids.add(hit['id'])
        updated.append((hit, b))
    else:
        new_locs.append(b)
orphaned = [e for e in existing if e['id'] not in matched_ids]
sys.stderr.write(f'Updated: {len(updated)}  |  New: {len(new_locs)}  |  Not found: {len(orphaned)}\n\n')

# ── 7. Abbreviation generator ─────────────────────────────────────────────────
STOP = {'the', 'a', 'an', 'on', 'at', 'in', 'of', 'and', '&'}

def abbreviate(name):
    words = name.split()
    sig = [w for w in words if w.lower() not in STOP] or words
    joined = ' '.join(sig)
    if len(joined) <= 15 and len(sig) <= 3:
        return joined
    # First word alone if short, else first + last
    first = sig[0]
    last  = sig[-1]
    candidate = f'{first} {last}' if first != last else first
    return candidate if len(candidate) <= 15 else first[:15]

# ── 8. TypeScript entry formatter ─────────────────────────────────────────────
def ts_entry(id_, abbrev, name, address, lat, lon):
    return (
        f'  {{\n'
        f'    id: {id_},\n'
        f'    abbreviation: "{abbrev}",\n'
        f'    name: "{name}",\n'
        f'    address: "{address}",\n'
        f'    lat: {round(lat, 4)},\n'
        f'    lon: {round(lon, 4)},\n'
        f'    category: "housing",\n'
        f'  }},'
    )

next_id = max((e['id'] for e in existing), default=1099) + 1
DIV = '// ' + '─' * 72

# ── 9. Print results ──────────────────────────────────────────────────────────
print(DIV)
print(f'// UPDATED ({len(updated)}) — existing entries with refreshed OSM data')
print(DIV)
for ex, b in updated:
    name    = b['name']    or ex['name']
    address = b['address'] or ex['address']
    print(ts_entry(ex['id'], ex['abbreviation'], name, address, b['lat'], b['lon']))

print()
print(DIV)
print(f'// NEW ({len(new_locs)}) — OSM buildings not yet in the dropoff list')
print(DIV)
for i, b in enumerate(new_locs):
    name = b['name'] or b['address'] or f'OSM {b["osm_id"]}'
    print(ts_entry(next_id + i, abbreviate(name), name, b['address'], b['lat'], b['lon']))

print()
print(DIV)
print(f'// NOT FOUND ({len(orphaned)}) — in dropoff list but no OSM match; review for deletion')
print(DIV)
for loc in orphaned:
    print(f'  // id: {loc["id"]}  |  "{loc["name"]}"  |  {loc["lat"]}, {loc["lon"]}')
PYTHON

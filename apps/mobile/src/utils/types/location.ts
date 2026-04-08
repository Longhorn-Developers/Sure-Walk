import { BuildingCategory } from "./building-category";

export type Location = {
  id: number;
  abbreviation: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  category: BuildingCategory;
};

export default Location;

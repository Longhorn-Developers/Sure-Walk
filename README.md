# Sure-Walk

### Build Badges

* ![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
* ![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
* ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
* [![Next.js][Next.js]][Next-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Tailwind CSS][Tailwind]][Tailwind-url]
* [![pnpm][pnpm]][pnpm-url]

## Table of Contents
- [Concise Description](#concise-description)
- [Overview](#overview)
  - [Problem Statement](#problem-statement)
  - [Solution](#solution)
- [Key Features and Benefits](#key-features-and-benefits)
- [Target Audience](#target-audience)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation Steps](#installation-steps)
- [Architecture](#high-level-architecture-overview)
  - [High-Level Architecture Overview](#high-level-architecture-overview)
  - [Key Components](#key-components)
  - [Design Principles](#design-principles)
- [Development Workflow](#development-workflow)
  - [Branch Naming Conventions](#branch-naming-conventions)
  - [Conventional Commits](#commit-message)
  - [Pull Request Process](#pr-process)
  - [Testing Expectations](#testing-expectations)
  - [Contribution Guidelines](#contribution-guidelines--code-of-conduct-reference)
  - [Code of Conduct](#contribution-guidelines--code-of-conduct-reference)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Open Source License](#open-source-license)
- [Links](#links)


### Concise Description
Sure Walk is a mobile app and web project meant to allow for a seamless process of booking a Sure Walk to travel on-campus to off-campus. The app provides a user-friendly experience with additional relevant information about Sure Walks. The website provides an interface for UT Sure Walk Staff to effectively manage Sure Walk bookings and driver assignments.


## Overview

### Problem Statement:
Sure Walk's current process of receiving requests and assigning drivers to students is inefficient and has much that can be improved upon. Students also have had varying experiences with arrival and wait estimation times.

### Solution:
Sure Walk aims to improve the processes of booking a Sure Walk through easier management of Sure Walk Driver assignments and more elaborate and relevant information. Through an improved software system, students will be able to have more information about the rides they book and Sure Walk managers will be able to effectively manage all bookings and drivers.


### Key Features and Benefits
- Stories and media on Longhorn traditions, events, and history
- Information on academic resources, student orgs, and support services
- Guided onboarding paths for first-year and transfer students
- Built with accessibility, responsiveness, and scalability in mind

### Target Audience
- Students who live off-campus and travel within the hours of 8pm - 2am
- UT Sure Walk Staff


## Getting Started 

### Prerequisites
1. Installations:
- [pnpm](https://pnpm.io)
- Git 

### Installation steps
```
pnpm install (in root directory)
pnpm install (in SureWalkApp/)
pnpm expo start (in terminal)
```

## High-level architecture overview
- Expo
- React Native for front-end
- TypeScript
- Next.js
- Tailwind CSS for styling
- Vercel for deployment and hosting
### Key components
- User App (React Native with Expo)
  - Provides UT students a mobile interface to request safe walks, track their walk in real-time, and communicate with their assigned Sure Walk driver.

- Driver App / Mode
  - Allows Sure Walk drivers to receive auto-assigned walk requests, navigate to pickup/drop-off locations, and chat with students.

- Dispatcher Dashboard (Web)
  - Enables coordinators to oversee all walk requests, manually assign drivers if needed, and monitor real-time walk progress.

- Authentication System
  - Integrates with UT EID + Duo for secure user verification and driver permissions.

- Real-Time Backend
  - Handles user-driver-dispatcher communication and updates for active walk sessions.

- GPS and Location Services
  - Tracks user and driver locations for real-time updates and routing.

- Database
  - Stores user profiles, walk history, driver logs, and route data.

### Design principles
- Safety-first UX
  - Prioritize clear visuals, status updates, and easy communication to reassure users throughout their walk.

- Minimal friction
  - Fast and simple request flow with default pickup locations, auto-driver assignment, and persistent session state.

- Privacy and data security
  - No unnecessary location tracking or data retention. Authentication is scoped and session-based.

- Real-time communication
  - Users, drivers, and dispatchers receive updates and can communicate instantly through in-app chat.

- Reliability and resilience
  - App maintains state across reloads and can recover gracefully from connection drops.

## Development Workflow
### Branch naming conventions + Conventional Commits
We follow the Conventional Commits specification for commit messages. This ensures a consistent commit history and enables automated versioning and changelog generation.

### Branch Naming Conventions 
```
<type>/<short-description>
```
Examples: 
- feature/{feature-name}
- fix/{bug-description}
- docs/{documentation-change}
### Commit Message
Follow this structure for commit messages
```
<type>(<scope>): <subject>
```
Where:
```type``` has one of the following:
- feat: New features
- fix: Bug fixes
- docs: Documentation changes
- style: Code formatting only
- refactor: Code changes without behavior change
- test: Adding or updating tests
- chore: Build process or tooling updates

### PR process
- Fork or branch from main
- Create a PR with a clear description
- Ensure checks pass (build, lint, test)
- Request review before merging

### Testing expectations
- Unit tests for UI components
- Integration tests for feature flows

### Contribution guidelines & Code of conduct reference
We welcome all to contribute! Please carefully read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started. All contributors must adhere to our Code of Conduct

## Available Scripts
-  ``pnpm expo start`` # Start expo app, needs ios simulator or android simulator unless using web version
- ``pnpm lint ``       # Lint codebase
- ``pnpm format ``     # Format code using Prettier
- ``pnpm expo start -c`` # Starts expo app, clearing cache, run if loading slowly

### Development commands
- ``pnpm expo start -c`` # Starts expo app, clearing cache, run if loading slowly
- ``pnpm expo start`` # Start expo app, needs ios simulator or android simulator unless using web version

### Linting & formatting commands
- ``pnpm lint ``       # Lint codebase
- ``pnpm format ``     # Format code using Prettier

## Project Structure

```text
/
├── SureWalkApp/
│   └── app/
│   └── assets/
│       └── fonts/
│       └── images/
│   └── tailwind.config.js
│   └── package.json
└── package.json
```

### Key files and their purposes
- SureWalkApp, contains the mobile application and its dependencies
- "SureWalkApp/app/", contains the main pages for the mobile application
- "SureWalkApp/tailwind.config.js", contains the custom styles and tailwind configuration
- "SureWalkApp/assets/", contains fonts and images files that can be referenced in the mobile app

## Deployment
### Environment information
- Hosted on [Vercel](https://vercel.com/)
### Deployment process
- Push changes to GitHub
- Vercel builds automatically from ``main`` branch
- Preview Deployments available on every PR
### Configuration details

## Open Source License
### Usually MIT but choose as needed as some dependencies may require a different license

## Links:

[Next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/

[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/

[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/

[pnpm]: https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white
[pnpm-url]: https://pnpm.io/

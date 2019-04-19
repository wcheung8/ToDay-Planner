# ToDay Planner
## Requirements:
* Node JS
* MongoDB
## Instructions to run
* Start MongoDB
* Clone the repo
* Insert valid google maps API key in `client/src/app/create-plan/create-plan.component.ts`, `client/src/app/app.module.ts`, and `client/src/index.html`
* `npm install` to install API dependencies and `npm start` to start the API
* Open a new terminal and navigate to the `client` directory, `npm install` to setup the Angular dependencies, and `npm start` to start the local development server
* comment out `import {google} from "@agm/core/services/google-maps-types";` in `client/src/app/create-plan/create-plan.component.ts` (library imports are messy)
* Open http://localhost:4200 to see the application

## Primary Code
Most of the driving code lies in `client/src/app/create-plan/create-plan.component.ts` and `client/src/app/create-plan/create-plan.component.html`

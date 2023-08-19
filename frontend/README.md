# Frontend

This is the frontend source code for Voxtir. The core technologies are React, Graphql, Auth0, Tailwind and vite.


## requirements
* That the backend is configured and setup. Does not have to be running atm
* node and npm is the correct versions. See package.json



## How to run
1. You need to define the environment variables
   1. Get a hold of the auth0 clientid and domain (ask your buddy)
   2. create an .env file with these values in the format defined by the .env-example
2. run `npm run generate`
   1. This goes into the server folder and runs graphql generate as this procedure is dependent on both the frontend and server
3. run `npm run dev`

This should launch the frontend on a local port 


## Auth
Auth is maintained by auth0 as due to the good support, security, and documentation. The inital approach in this repo is based on the sample below. If you want to understand the logic, please refer to that documentation

Visit the ["React/TypeScript + React Router 6 Code Sample: User Authentication For Basic Apps"](https://developer.auth0.com/resources/code-samples/spa/react/basic-authentication/typescript-react-router-6) page for instructions on how to configure and run this code sample and how to integrate it with an API server of your choice to [create a full-stack code sample](https://developer.auth0.com/resources/code-samples/full-stack/hello-world/basic-access-control/spa).


## Known issues

There might be some CORS issues to the backend
# Voxtir API server

This part of the repo is dedicated to the backend of the Voxtir app. 

The core is an express api that handles both the ws connection for the frontend and the GQL api. It will probably later be extended to include a rest api if needed

We follow the standard apollo naming convention found [here](https://www.apollographql.com/docs/technotes/TN0002-schema-naming-conventions)
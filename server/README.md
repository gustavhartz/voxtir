# Voxtir API server

This part of the repo is dedicated to the backend of the Voxtir app. 

The core is an express api that handles both the ws connection for the frontend and the GQL api. It will probably later be extended to include a rest api if needed

We follow the standard apollo naming convention found [here](https://www.apollographql.com/docs/technotes/TN0002-schema-naming-conventions)


## Development
Run the commands in the package.json folder
1. npm i
2. npm run generate
3. npm run tsc # one terminal
4. npm run dev # other terminal


### Quickstart Docker

```
# Build docker
docker build -t voxtir-backend . 

# If mac m1 we need to use buildx to set the target architecture
docker buildx build --platform linux/amd64 -t voxtir-app-backend .

# Run docker
docker run -p 3000:3000 -e APP_PORT=3000 voxtir-backend
```
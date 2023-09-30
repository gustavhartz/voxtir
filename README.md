# Voxtir 🎤

This project is the source code for the **Voxtir app**. The voxtir app is a transcription service solution built for AWS that can be self-hosted as a cheaper alternative to public solutions for larger scale operations, but primarly  to ensure
that there is full transparancy in how the data is stored.

The solution is built upon the OpenAI Whisper model and a Pyannote for Speaker Dizaritation model.

The transcripts are HTML documents conforming to quite strict TipTap/Prosemirror schemas. This makes backwardscompatible changes
a bit difficult, but has the great benefit of allowing quite easy processing of the documents into a format that can
be used to train/fine-tune your own transcription models.

You can host this solution your self or let us help you by reaching out at gsh (AT) voxtir.com.

**WIP:** A goal of this software is also to improve performance of publicly available models. Thus we will offer free services to any entity willing to share the transcribed data.

## The app
This is how (at the time of writing 🙏 ) the app looks.

**Document**
![Document page](./assets/Document.png)

**Document overview panel**
![Document page](./assets/DocumentOverview.png)

The app allows for sharing between users and collaborative editing of documents.
## The costs

**Self-hosted**
The smallest setup in AWS we have created costs around 130\$ a month in fixed costs and around 0.25\$ pr. transcribed hour using the medium model. This should
be able to handle up to at least 50 concurrent workers writing the editor. There is no limit on the number of transcriptions that can be run at once. This is determined by AWS Quotas.

**Voxtir**
We currently only offer a free beta version, but plan to charge 0\$ pr. transcribed hour where the transcript is corrected and shared with other users and 0.5\$ pr. transcribed hour if kept private using the large models. We can also host a completely private instance for you incorporating IP-restrictions.

## The infrastructure
The code consists of four different "services". There is:
* React Typescript Vite frontend
* Express Typescript Nodejs backend
* whisper-server which is a python app intended to run on AWS Batch Transform as a Flask API.
* AWS lambda running ffmpeg

**High-level diagram**
![Draw.io file in assets](./assets/VoxtirHighlevel.svg)

**Frontend**
The frontend is a typescript frontend using React vite as the framework. It's pretty basic and primarly consists of the
tiptap editor along with some general structure for how to navigate the user projects. There are two types of connections
to the backend. The collabrative editing in the tiptap editor requires Websockets, and the api is a Graphql api.

Technologies
* Graphql
* Tiptap
* Typescript
* React
* Vite
* Tailwind

We built it to be hosted from an S3 bucket. More info in the corresponding folder

**Backend**
The backend is a nodejs server that handles everything and is connected
to the database. This backend is hosted in AWS ECS and is intended to be able to scale horizontally, with multiple
new instances spun up.

Technologies
* Websocket
* Graphql
* Express
* Typescript
* AWS S3
* AWS Sagemaker
* AWS Amplify
* AWS Fargate (ECS)
* Resend
* RDS
* PostgreSQL
* Prisma

**Database**
There is a single PostgreSQL database connected to the backend. Migrations and patches are handled by prisma in the backend.

**Devops code**
There is a seperate devops repo. It's not shared just due to security reasons, but you should be able to infer the production
setup from the various visualizations. 

**Auth**
Auth is maintained by auth0 as due to the good support, security, and documentation. The initial approach in this repo is based on the sample below. If you want to understand the logic, please refer to that documentation

Visit the ["React/TypeScript + React Router 6 Code Sample: User Authentication For Basic Apps"](https://developer.auth0.com/resources/code-samples/spa/react/basic-authentication/typescript-react-router-6) page for instructions on how to configure and run this code sample and how to integrate it with an API server of your choice to [create a full-stack code sample](https://developer.auth0.com/resources/code-samples/full-stack/hello-world/basic-access-control/spa).


## Development and Contributions

In the pre-production phase there is no distinction between the development and production branch

commits should be made using. External link is optional

```
<branch-type>/<branch-name>_<external-link (JIRA etc.)>
# example
bug/database-connection-pool_445
```

types include

```
wip       Works in progress; stuff I know won't be finished soon
feat      Feature I'm adding or expanding
bug       Bug fix or experiment
junk      Throwaway branch created to experiment
```

### Develop locally

**Whisper-server**
This project can be run on it's own. See it's corresponding folder

**Frontend**
1. create an .env file from the example
   1. Get a hold of the auth0 clientid and domain (ask your buddy)
2. `npm i`
3. `npm run generate`
4. `npm run dev`

The frontend has a lot of functionality that is dependent on the backend. Thus you might need to spin that up first.

**Server**
We follow the standard apollo naming convention found [here](https://www.apollographql.com/docs/technotes/TN0002-schema-naming-conventions)

Run the commands in the package.json folder
1. `npm i`
2. `npm run generate`
3. `npm run tsc # one terminal`
4. `npm run dev # other terminal`


**Docker**
The server runs of a docker container in production. Try it locally using

```
# Build docker
docker build -t voxtir-backend . 

# If mac m1 we need to use buildx to set the target architecture
docker buildx build --platform linux/amd64 -t voxtir-app-backend .

# Run docker
docker run -p 3000:3000 -e APP_PORT=3000 voxtir-backend
```

If you wan't to access the /graphql endpoint in the browser for the sandbox - then you need to modify your headers to include the auth0 token. It can be obtained by modifying the frontend code and logging the token. The could be simpler ways of doing this too.

**Database**

```
docker-compose up -d postgres
```

Once you change the schema in the `schema.prisma`, apply the migrations in the **local database** using prisma. This is found in the server folder.

If yo want to see the database you can use 
`npx prisma studio --schema src/prisma/schema.prisma`
from the server folder

### IDE
VSCode
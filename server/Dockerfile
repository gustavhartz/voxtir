FROM node:18.16.0

LABEL version="1.0"
LABEL description="This is the base docker image for voxtir transcription app backend"
LABEL maintainer = ["gustav@voxtir"]


WORKDIR /usr/app
# Moving way to many files
COPY . ./

# Get typescript base
RUN npm install
RUN npm run generate
RUN npx tsc

# Install production dependencies - hopefully this removes the dev dependencies
RUN npm pkg delete scripts.prepare && npm ci --omit=dev
RUN npm run prisma-generate

RUN cp -r ./dist/. .

# Remove unused files
RUN rm -rf src/
RUN rm -rf dist/

CMD ["node", "index.js"]
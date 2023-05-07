# Voxtir 🎤
The main speech to text and insights service

## Develop locally


TODO: Describe



## Database

To work with the database, you should connect to it. First rename the .env-example to .env to make docker-compoose include required env vars, then start the postgres service with:

```
docker-compose up -d postgres
```

Once you change the schema in the `schema.prisma`, apply the migrations in the **local database** with:

```
npx prisma migrate dev --schema server/prisma/schema.prisma
```

Prisma Studio:

```
npx prisma studio --schema server/prisma/schema.prisma
```

<span style="color:red">Known issues</span>:

- If your using windows and already use postgresql for other projects and can't get prisma to work see this [link](https://github.com/prisma/prisma/issues/8927)
- Prisma has a compatibility issue on the M1 Macbooks - see this [issue](https://github.com/prisma/prisma/issues/8478). This means that the build could fail locally when running:

```
docker build .
```

Changing the image from node:16-alpine to node:16 resolves the issue, but this change **should not be committed** as it dramatically increases the build size

## Development and git procedure

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
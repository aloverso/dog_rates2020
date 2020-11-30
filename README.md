# dog_rates 2020

This is a full-stack JavaScript app for a voting bracket on
 the best of the best dogs of 2020 from [@dog_rates](https://twitter.com/dog_rates).

## Getting Started

### npm Dependencies

You'll need npm and node installed.

For npm dependencies, this will install all for the frontend and backend folders:
```shell script
./scripts/install-all.sh
```

### postgres

If not already installed, install postgres.
Make sure you have `psql` installed as well, and that postgres is running on port 5432.
Your postgres user should have no password.

Create postgres local DB:
```shell script
psql -c 'create database dograteslocal;' -U postgres
```

Run local database migrations:
```shell script
./scripts/db-migrate.sh
```

### Seeding with data

This app needs tweet data from [@dog_rates](https://twitter.com/dog_rates) to work.  To do this,
there are two options. Self-populate your data, or use fixture data (contains only 2 months of tweets).

To self-populate your database, you need a Twitter OAuth 2.0 Bearer Token.  You can follow 
[Twitter's instructions](https://developer.twitter.com/en/docs/apps/overview) to create a developer
app and obtain a token.  Save this to your environment as `TWITTER_TOKEN`.

If you are using fixture data, do not set this environment variable at all.

Next, for either datasource, start the backend app locally and post to the `/populate` endpoint.
```shell script
npm --prefix=backend run start:dev -- &
curl -X POST localhost:8080/populate
kill $(lsof -i:8080 -t)
```

This will populate the `tweets` table and its corresponding `images` table.

## Development

Start frontend dev server:
```shell script
./scripts/frontend-start.sh
```

Start backend dev server:
```shell script
./scripts/backend-start.sh
```

The backend will run on port 8080 and the frontend will run on port 3000.

Run all [jest](https://jestjs.io/) tests:
```shell script
./scripts/test-all.sh
```

In addition to tests, this script will run linting (via [eslint](https://eslint.org/)) and dependency 
boundary checks (via [good-fences](https://github.com/smikula/good-fences))

Run [cypress](https://www.cypress.io/) feature tests:
```shell script
./scripts/feature-tests.sh
```

This will start and stop the server for itself, including a [Wiremock](https://github.com/tomasbjerre/wiremock-npm)
server to provide stub versions of API dependencies.

### Adding DB migrations

```shell script
npm --prefix=backend run db-migrate create [migration-name] -- --sql-file
```

## Pushing changes

Always push via ship-it ([why?](https://medium.com/@AnneLoVerso/ship-it-a-humble-script-for-low-risk-deployment-1b8ba99994f7))
```shell script
./scripts/ship-it.sh
```

## Deployment

Build frontend, build backend, compile all into one directory:
```shell script
./scripts/build.sh
```

Start the production server (frontend & backend)
```shell script
./scripts/prod-start.sh
```

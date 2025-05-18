# Template-express-5

### Main features:

- 🚄 [ExpressJS](http://expressjs.com) framework with [TypeScript](https://www.typescriptlang.org/) on the board
- ♻️ Live reload
- 🏇 minified and optimized code for production build
- ✏️ Linting via [ESLint](https://eslint.org) with Airbnb configuration
- 🚑 Code Formatter with [Prettier](https://prettier.io)
- 📘 VSCode configuration: Debug, Settings, Tasks and extension for ESLint, Prettier, TypeScript
- 🏄 And many more...

## Getting started

```bash
npm i
npm run build
```

Run the app:

```bash
npm run server:prod
```

Go to:

```
 http://localhost:8080/api/health
```

If you see the following response in the browser:

```
{"status":"OK","data":"2022-02-13T20:05:13.965Z"}
```

Run server in dev mode:

```
npm run server:dev
```

## Code linting

Run code quality analysis using

```sh
npm run lint
```

## Fixing problems

Automatically fix linter's problems

```sh
npm run lint:fix
```

## Logging

```javascript
import logger from '@core/utils/logger';

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
logger.silly('message'); // level 6
```

In development mode, log messages of all severity levels will be printed to the console.
In production mode, only `info`, `warn`, and `error` logs will be printed to the console.

## Troubleshooting

To help you diagnose problems, a Unique Request ID is added to each incoming request and printed to a log. This allows you to correlate log entries for a given web request across multiple log data sources.

Here are some examples of log entries for a Create User request (/api/user):

```log
web_1  | 2022-12-18 09:56:51 8e06413b-1cbb-41d4-baf3-01ee12b94602 info START Request Id: 8e06413b-1cbb-41d4-baf3-01ee12b94602
web_1  | 2022-12-18 09:56:51 8e06413b-1cbb-41d4-baf3-01ee12b94602 debug User created: { name: 'John Doe', email: 'john.d@example.net' }
web_1  | 2022-12-18 09:56:51 8e06413b-1cbb-41d4-baf3-01ee12b94602 info POST /api/user 201 - 145.525 ms
web_1  | 2022-12-18 09:56:51 8e06413b-1cbb-41d4-baf3-01ee12b94602 info END Request Id: 8e06413b-1cbb-41d4-baf3-01ee12b94602
```
🙌 Thanks

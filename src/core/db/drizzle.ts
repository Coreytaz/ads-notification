import config from '@config/config';
import logger from '@core/utils/logger';
import { createClient } from '@libsql/client';
import { drizzle as _drizzle } from 'drizzle-orm/libsql';

const client = createClient({ url: config.dbConnect });

const drizzle = _drizzle({ client, logger: config.isDev ? { logQuery: (msg) => logger.debug(msg) } : undefined, });

export { client, drizzle };
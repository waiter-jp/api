/**
 * redis cacheクライアント
 */
import * as waiter from '@waiter/domain';
// import * as createDebug from 'debug';

// const debug = createDebug('waiter:redis');

let client: waiter.redis.Redis | undefined;

function createClient() {
    const c = new waiter.redis({
        // tslint:disable-next-line:no-magic-numbers
        port: parseInt(<string>process.env.REDIS_PORT, 10),
        host: <string>process.env.REDIS_HOST,
        password: <string>process.env.REDIS_KEY
        // tls: <any>{ servername: <string>process.env.REDIS_HOST }
    });

    c.on('error', (err: any) => {
        // tslint:disable-next-line:no-console
        console.error(err);
    });

    // c.on('end', () => {
    //     debug('end');
    // });

    return c;
}

export function getClient() {
    if (client === undefined) {
        client = createClient();
    }

    return client;
}

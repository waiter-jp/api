/**
 * sql serverクライアント
 *
 * @module
 */

import * as tedious from 'tedious';

const sqlServerConnection = new tedious.Connection({
    userName: process.env.SQL_SERVER_USERNAME,
    password: process.env.SQL_SERVER_PASSWORD,
    server: process.env.SQL_SERVER_SERVER,

    // If you're on Windows Azure, you will need this:
    options: {
        database: process.env.SQL_SERVER_DATABASE,
        encrypt: true
    }
});

sqlServerConnection.on('connect', (connectErr: any) => {
    if (connectErr instanceof Error) {
        console.error(connectErr);
    }
});

export default sqlServerConnection;

// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const {
  mysqlConnParams
} = require('../backend.config');

async function main () {

  // Database connection
  const conn = await mysql.createConnection(mysqlConnParams);
  
  // Create API with a default connection to the local node
  const api = await ApiPromise.create();
  
  // Fetch active accounts
  const accounts = await api.derive.accounts.indexes();

  // Log active accounts
  console.log(JSON.stringify(accounts, null, 2));

  // Insert in DB
  for (var key in accounts ) {
    if (accounts.hasOwnProperty(key)) {
      console.log(key + " -> " + accounts[key]);
      var sqlInsert = 'INSERT INTO account_index (accountId, accountIndex) VALUES (\'' + key + '\', \'' + accounts[key] + '\');';
      let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
    }
  }

  conn.end();
}

main().catch(console.error).finally(() => process.exit());
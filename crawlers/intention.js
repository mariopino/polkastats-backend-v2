// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const {
  wsProviderUrl,
  mysqlConnParams
} = require('../backend.config');

async function main () {

  //
  // Database connection
  //
  const conn = await mysql.createConnection(mysqlConnParams);
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  //
  // Get best block number
  //
  const bestNumber = await api.derive.chain.bestNumber();

  //
  // Outputs JSON
  //
  console.log(`bestNumber:`, bestNumber);
  
  //
  // Fetch intention validators
  //
  const stakingValidators = await api.query.staking.validators();
  const validators = stakingValidators[0];

  //
  // Map validator authorityId to staking info object
  //
  const validatorStaking = await Promise.all(
    validators.map(authorityId => api.derive.staking.account(authorityId))
  );

  //
  // Add hex representation of sessionId[] and nextSessionId[]
  //
  for(let i = 0; i < validatorStaking.length; i++) {
    let validator = validatorStaking[i];
    if (validator.sessionIds) {
      validator.sessionIdHex = validator.sessionIds.toHex();
    }
    if (validator.nextSessionIds) {
      validator.nextSessionIdHex = validator.nextSessionIds.toHex();
    }
  }

  if (validatorStaking) {
    console.log(`block_height: ${bestNumber}`);
    console.log(`intentions: ${JSON.stringify(validatorStaking, null, 2)}`);
    var sqlInsert = 'INSERT INTO validator_intention (block_height, timestamp, json) VALUES (\'' + bestNumber + '\', UNIX_TIMESTAMP(), \'' + JSON.stringify(validatorStaking) + '\');';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());
//
// Return identity of all validator, intention and nominator accounts
//

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
  // Get validators
  //
  const validators = await api.query.session.validators();

  //
  // Get intentions
  //
  const stakingValidators = await api.query.staking.validators();
  const intentions = stakingValidators[0];

  //
  // Get nominators
  //
  const validatorStaking = await Promise.all(
    validators.map(authorityId => api.derive.staking.account(authorityId))
  );

  let nominators = [];
  for(let i = 0; i < validatorStaking.length; i++) {
    let validator = validatorStaking[i];
    if (validator.stakers.others.length > 0) {
      for (let j = 0; j < validator.stakers.others.length; j++) {
        let nominator = validator.stakers.others[j];
        nominators.push(nominator.who)
      }
    }
  }

  let accounts = nominators.concat(validators, intentions);
  console.log(`accounts:`, JSON.stringify(accounts, null, 2));

  //
  // Get accountInfo
  //
  const accountInfo = await Promise.all(
    accounts.map(accountId => api.derive.accounts.info(accountId))
  );

  console.log(`accountInfo:`, JSON.stringify(accountInfo, null, 2));

  let stakingAccountsInfo = []
  accountInfo.forEach(account => {
    if (account.identity.display) {
      stakingAccountsInfo.push(account);
    }
  });

  console.log(`stakingAccountsInfo:`, JSON.stringify(stakingAccountsInfo, null, 2));
  console.log(`stakingAccountsInfo num:`, stakingAccountsInfo.length);

  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());

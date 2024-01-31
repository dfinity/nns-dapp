// On mainnet, the ckBTC Index canister polls new transactions event two seconds.
// By delaying such an action as reloading the transactions, we can optimistically try to fetch the last transaction(s).
// Useful for example when a user send ckBTC to ckBTC.
export const WALLET_TRANSACTIONS_RELOAD_DELAY = 4000;

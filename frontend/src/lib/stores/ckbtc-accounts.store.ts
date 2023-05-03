import { initIcrcAccountsStore } from "$lib/stores/icrc-accounts.store";

/**
 * ckBTC has the particularity to hold accounts for the users with an ICRC ledger but, also to use a minter to convert BTC to ckBTC back and forth.
 * When a user convert ckBTC to BTC, the user first transfer ckBTC to the ledger with withdrawal addresses which, are accounts but not stricto sensu accounts we want to display to the users as any other main, sub or hw accounts.
 * In addition, these accounts need more work to be loaded - more update calls.
 * That is why we hold the withdrawal accounts in a separate store.
 */
export const ckBTCWithdrawalAccountsStore = initIcrcAccountsStore();

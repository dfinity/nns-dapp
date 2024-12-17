<script lang="ts">
  import IcrcWalletTransactionsObserver from "$lib/components/accounts/IcrcWalletTransactionsObserver.svelte";
  import {
    CKTESTBTC_INDEX_CANISTER_ID,
    CKTESTBTC_LEDGER_CANISTER_ID,
  } from "$lib/constants/ckbtc-canister-ids.constants";
  import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
</script>

<IcrcWalletTransactionsObserver
  account={mockCkBTCMainAccount}
  completed={true}
  ledgerCanisterId={CKTESTBTC_LEDGER_CANISTER_ID}
  indexCanisterId={CKTESTBTC_INDEX_CANISTER_ID}
>
  <div data-tid="test-observer"></div>
</IcrcWalletTransactionsObserver>

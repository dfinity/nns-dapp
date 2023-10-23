<script lang="ts">
  import CkBTCWalletTransactionsObserver from "$lib/components/accounts/CkBTCWalletTransactionsObserver.svelte";
  import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
  import {
    CKTESTBTC_INDEX_CANISTER_ID,
    CKTESTBTC_UNIVERSE_CANISTER_ID,
  } from "$lib/constants/ckbtc-canister-ids.constants";
</script>

<CkBTCWalletTransactionsObserver
  account={mockCkBTCMainAccount}
  completed={true}
  universeId={CKTESTBTC_UNIVERSE_CANISTER_ID}
  indexCanisterId={CKTESTBTC_INDEX_CANISTER_ID}
>
  <div data-tid="test-observer" />
</CkBTCWalletTransactionsObserver>

<script lang="ts">
  import IcrcWalletTransactionsObserver from "$lib/components/accounts/IcrcWalletTransactionsObserver.svelte";
  import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
  import {
    CKTESTBTC_INDEX_CANISTER_ID,
    CKTESTBTC_UNIVERSE_CANISTER_ID,
  } from "$lib/constants/ckbtc-canister-ids.constants";
</script>

<IcrcWalletTransactionsObserver
  account={mockCkBTCMainAccount}
  completed={true}
  universeId={CKTESTBTC_UNIVERSE_CANISTER_ID}
  indexCanisterId={CKTESTBTC_INDEX_CANISTER_ID}
>
  <div data-tid="test-observer" />
</IcrcWalletTransactionsObserver>

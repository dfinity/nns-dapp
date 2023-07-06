<script lang="ts">
  import CkBTCBalancesObserver from "$lib/components/accounts/CkBTCBalancesObserver.svelte";
  import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
  import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";

  export let reload: (() => void) | undefined = undefined;
</script>

<CkBTCBalancesObserver
  accounts={[mockCkBTCMainAccount]}
  universeId={CKTESTBTC_UNIVERSE_CANISTER_ID}
  {reload}
>
  <div data-tid="test-observer" />
</CkBTCBalancesObserver>

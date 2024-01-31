<script lang="ts">
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
  import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";

  export let reload: (() => void) | undefined = undefined;
</script>

<IcrcBalancesObserver
  accounts={[mockCkBTCMainAccount]}
  universeId={CKTESTBTC_UNIVERSE_CANISTER_ID}
  {reload}
>
  <div data-tid="test-observer" />
</IcrcBalancesObserver>

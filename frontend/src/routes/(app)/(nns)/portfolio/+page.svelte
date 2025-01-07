<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import Portfolio from "$lib/pages/Portfolio.svelte";
  import {
    loadAccountsBalances,
    loadSnsAccountsBalances,
    resetBalanceLoading,
  } from "$lib/services/accounts-balances.services";
  import { loadCkBTCTokens } from "$lib/services/ckbtc-tokens.services";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { onMount } from "svelte";

  onMount(() => {
    resetBalanceLoading();
    loadCkBTCTokens();
    loadIcpSwapTickers();
  });

  $: if ($authSignedInStore) {
    const ckBTCUniverseIds = $ckBTCUniversesStore.map(
      (universe) => universe.canisterId
    );
    loadAccountsBalances(ckBTCUniverseIds);

    const icrcUniverseIds = Object.keys($icrcCanistersStore);
    loadAccountsBalances(icrcUniverseIds);

    const snsRootCanisterIds = $snsProjectsCommittedStore.map(
      ({ rootCanisterId }) => rootCanisterId
    );
    loadSnsAccountsBalances(snsRootCanisterIds);
  }
</script>

<TestIdWrapper testId="portfolio-route-component"><Portfolio /></TestIdWrapper>

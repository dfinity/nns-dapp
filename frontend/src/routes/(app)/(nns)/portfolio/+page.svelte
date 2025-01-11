<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
  import { tokensListVisitorsStore } from "$lib/derived/tokens-list-visitors.derived";
  import Portfolio from "$lib/pages/Portfolio.svelte";
  import {
      loadAccountsBalances,
      loadSnsAccountsBalances,
      resetBalanceLoading,
  } from "$lib/services/accounts-balances.services";
  import { loadCkBTCTokens } from "$lib/services/ckbtc-tokens.services";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { UserToken } from "$lib/types/tokens-page";
  import { getTableProjects } from "$lib/utils/staking.utils";

  resetBalanceLoading();
  loadIcpSwapTickers();
  loadCkBTCTokens();

  let userTokens: UserToken[];
  $: userTokens = $tokensListVisitorsStore;

  $: if ($authSignedInStore) {
    const ckBTCUniverseIds = $ckBTCUniversesStore.map(
      (universe) => universe.canisterId
    );
    loadAccountsBalances(ckBTCUniverseIds);
  }

  $: if ($authSignedInStore) {
    const icrcUniverseIds = Object.keys($icrcCanistersStore);
    loadAccountsBalances(icrcUniverseIds);
  }

  $: if ($authSignedInStore) {
    const snsRootCanisterIds = $snsProjectsCommittedStore.map(
      ({ rootCanisterId }) => rootCanisterId
    );
    loadSnsAccountsBalances(snsRootCanisterIds);
  }
  $: if ($authSignedInStore) {
    userTokens = $tokensListUserStore;
  }

</script>

<TestIdWrapper testId="portfolio-route-component"
  ><Portfolio
    {userTokens}
    tableProjects={getTableProjects({
      universes: $selectableUniversesStore,
      isSignedIn: $authSignedInStore,
      nnsNeurons: $neuronsStore?.neurons,
      snsNeurons: $snsNeuronsStore,
      icpSwapUsdPrices: $icpSwapUsdPricesStore,
    })}
  /></TestIdWrapper
>

<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
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
  import { loadProposalsSnsCF } from "$lib/services/public/sns.services";
  import { failedActionableSnsesStore } from "$lib/stores/actionable-sns-proposals.store";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import { snsProposalsStoreIsLoading } from "$lib/stores/sns.store";
  import { stakingRewardsStore } from "$lib/stores/staking-rewards.store";
  import type { TableProject } from "$lib/types/staking";
  import type { UserToken } from "$lib/types/tokens-page";
  import { getTableProjects } from "$lib/utils/staking.utils";

  resetBalanceLoading();
  loadCkBTCTokens();

  let icpToken: UserToken | undefined;
  $: icpToken = $tokensListUserStore.find(
    ({ universeId }) => universeId.toText() === OWN_CANISTER_ID_TEXT
  );

  let nonIcpTokens: UserToken[];
  $: nonIcpTokens = $tokensListVisitorsStore.filter(
    ({ universeId }) => universeId.toText() !== OWN_CANISTER_ID_TEXT
  );

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
    icpToken = $tokensListUserStore.find(
      ({ universeId }) => universeId.toText() === OWN_CANISTER_ID_TEXT
    );
    nonIcpTokens = $tokensListUserStore.filter(
      (token) => token.universeId.toText() !== OWN_CANISTER_ID_TEXT
    );
  }

  $: if ($snsProposalsStoreIsLoading) {
    loadProposalsSnsCF({ omitLargeFields: false });
  }

  let icpTableProject: TableProject;
  $: icpTableProject = getTableProjects({
    universes: $selectableUniversesStore.filter(
      ({ canisterId }) => canisterId === OWN_CANISTER_ID_TEXT
    ),
    isSignedIn: $authSignedInStore,
    nnsNeurons: $neuronsStore?.neurons,
    snsNeurons: $snsNeuronsStore,
    icpSwapUsdPrices: $icpSwapUsdPricesStore,
    failedActionableSnses: $failedActionableSnsesStore,
    stakingRewardsResult: $stakingRewardsStore,
  })[0];
  let nonIcpTableProjects: TableProject[];
  $: nonIcpTableProjects = getTableProjects({
    universes: $selectableUniversesStore.filter(
      ({ canisterId }) => canisterId !== OWN_CANISTER_ID_TEXT
    ),
    isSignedIn: $authSignedInStore,
    nnsNeurons: $neuronsStore?.neurons,
    snsNeurons: $snsNeuronsStore,
    icpSwapUsdPrices: $icpSwapUsdPricesStore,
    failedActionableSnses: $failedActionableSnsesStore,
    stakingRewardsResult: $stakingRewardsStore,
  });
</script>

<TestIdWrapper testId="portfolio-route-component"
  ><Portfolio
    {icpToken}
    {nonIcpTokens}
    {icpTableProject}
    {nonIcpTableProjects}
    stakingRewardResult={$stakingRewardsStore}
  /></TestIdWrapper
>

<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import SnsNeuronsFooter from "$lib/components/sns-neurons/SnsNeuronsFooter.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { snsCommittedProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import {
    loadAccountsBalances,
    loadSnsAccountsBalances,
  } from "$lib/services/accounts-balances.services";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { nonNullish } from "@dfinity/utils";

  loadIcpSwapTickers();

  // ==================================
  // Staking Rewards/APY related logic
  // ==================================
  // load ckBTC
  $effect(() => {
    if ($authSignedInStore) {
      const ckBTCUniverseIds = $ckBTCUniversesStore.map(
        (universe) => universe.canisterId
      );
      loadAccountsBalances(ckBTCUniverseIds);
    }
  });
  // load other ck and imported tokens
  $effect(() => {
    if ($authSignedInStore) {
      const icrcUniverseIds = Object.keys($icrcCanistersStore);
      loadAccountsBalances(icrcUniverseIds);
    }
  });
  $effect(() => {
    if ($authSignedInStore) {
      const snsRootCanisterIds = $snsProjectsCommittedStore.map(
        ({ rootCanisterId }) => rootCanisterId
      );
      loadSnsAccountsBalances(snsRootCanisterIds);
    }
  });
</script>

<TestIdWrapper testId="neurons-component">
  <main>
    <SummaryUniverse />

    {#if $isNnsUniverseStore}
      <NnsNeurons />
    {:else if nonNullish($snsCommittedProjectSelectedStore)}
      <SnsNeurons />
    {/if}
  </main>

  {#if $isNnsUniverseStore}
    <NnsNeuronsFooter />
    <!-- Staking SNS Neurons has not yet been reviewed by security -->
  {:else if nonNullish($snsCommittedProjectSelectedStore)}
    <SnsNeuronsFooter />
  {/if}
</TestIdWrapper>

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>

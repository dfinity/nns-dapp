<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
  import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
  import {
    loadAccountsBalances,
    loadSnsAccountsBalances,
  } from "$lib/services/accounts-balances.services";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    neuronId?: string | null;
  };
  const { neuronId }: Props = $props();

  loadIcpSwapTickers();

  layoutTitleStore.set({
    title: $i18n.neuron_detail.title,
  });

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

<TestIdWrapper testId="neuron-detail-component">
  {#if $isNnsUniverseStore}
    <NnsNeuronDetail neuronIdText={neuronId} />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsNeuronDetail {neuronId} />
  {/if}
</TestIdWrapper>

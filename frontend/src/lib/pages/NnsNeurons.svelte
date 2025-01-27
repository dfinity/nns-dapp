<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import LosingRewardsBanner from "$lib/components/neurons/LosingRewardsBanner.svelte";
  import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";
  import { listNeurons } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import {
    ENABLE_PERIODIC_FOLLOWING_CONFIRMATION,
    ENABLE_USD_VALUES_FOR_NEURONS,
  } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { tableNeuronsFromNeuronInfos } from "$lib/utils/neurons-table.utils";
  import { getTotalStakeInUsd } from "$lib/utils/staking.utils";
  import { IconNeuronsPage, Spinner } from "@dfinity/gix-components";
  import { onMount } from "svelte";
  import { startReducingVotingPowerAfterSecondsStore } from "$lib/derived/network-economics.derived";

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  onMount(() => {
    listNeurons();
  });

  let tableNeurons: TableNeuron[] = [];
  $: tableNeurons = tableNeuronsFromNeuronInfos({
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
    neuronInfos: $definedNeuronsStore,
    icpSwapUsdPrices: $icpSwapUsdPricesStore,
    startReducingVotingPowerAfterSeconds:
      $startReducingVotingPowerAfterSecondsStore,
  });

  let totalStakeInUsd: number;
  $: totalStakeInUsd = getTotalStakeInUsd(tableNeurons);
</script>

<TestIdWrapper testId="nns-neurons-component">
  {#if isLoading}
    <Spinner />
  {:else if tableNeurons.length > 0}
    <div class="container">
      {#if $ENABLE_PERIODIC_FOLLOWING_CONFIRMATION}
        <LosingRewardsBanner />
      {/if}
      {#if $ENABLE_USD_VALUES_FOR_NEURONS}
        <UsdValueBanner usdAmount={totalStakeInUsd} hasUnpricedTokens={false}>
          <IconNeuronsPage slot="icon" />
        </UsdValueBanner>
      {/if}
      <NeuronsTable neurons={tableNeurons} />
    </div>
  {:else}
    <EmptyMessage>{$i18n.neurons.text}</EmptyMessage>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>

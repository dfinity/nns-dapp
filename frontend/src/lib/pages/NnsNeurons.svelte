<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import LosingRewardsBanner from "$lib/components/neurons/LosingRewardsBanner.svelte";
  import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import {
    neuronMinimumDissolveDelayToVoteSeconds,
    startReducingVotingPowerAfterSecondsStore,
  } from "$lib/derived/network-economics.derived";
  import { nonEmptyNeuronStore } from "$lib/derived/neurons.derived";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import { listNeurons } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { ENABLE_APY_PORTFOLIO } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { stakingRewardsStore } from "$lib/stores/staking-rewards.store";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { tableNeuronsFromNeuronInfos } from "$lib/utils/neurons-table.utils";
  import { getTotalStakeInUsd } from "$lib/utils/staking.utils";
  import { IconNeuronsPage, Spinner } from "@dfinity/gix-components";
  import { onMount } from "svelte";

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
    neuronInfos: $nonEmptyNeuronStore,
    icpSwapUsdPrices: $icpSwapUsdPricesStore,
    startReducingVotingPowerAfterSeconds:
      $startReducingVotingPowerAfterSecondsStore,
    minimumDissolveDelay: $neuronMinimumDissolveDelayToVoteSeconds,
    stakingRewardsResult: $ENABLE_APY_PORTFOLIO
      ? $stakingRewardsStore
      : undefined,
  });

  let totalStakeInUsd: number;
  $: totalStakeInUsd = getTotalStakeInUsd(tableNeurons);
</script>

<TestIdWrapper testId="nns-neurons-component">
  {#if isLoading}
    <Spinner />
  {:else if tableNeurons.length > 0}
    <div class="container">
      <LosingRewardsBanner />

      <UsdValueBanner usdAmount={totalStakeInUsd} hasUnpricedTokens={false}>
        <IconNeuronsPage slot="icon" />
      </UsdValueBanner>
      <NeuronsTable neurons={tableNeurons} />
    </div>
  {:else}
    <EmptyMessage>{$i18n.neurons.text}</EmptyMessage>
  {/if}

  <NnsNeuronModals />
</TestIdWrapper>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>

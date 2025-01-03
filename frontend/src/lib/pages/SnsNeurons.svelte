<script lang="ts">
  import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import { definedSnsNeuronStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
  import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
  import { claimNextNeuronIfNeeded } from "$lib/services/sns-neurons-check-balances.services";
  import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { ENABLE_USD_VALUES_FOR_NEURONS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import type { SnsSummary } from "$lib/types/sns";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { tableNeuronsFromSnsNeurons } from "$lib/utils/neurons-table.utils";
  import { getTotalStakeInUsd } from "$lib/utils/staking.utils";
  import { IconNeuronsPage, Spinner } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";

  let loading = true;

  const syncNeuronsForProject = async (
    selectedProjectCanisterId: Principal | undefined
  ): Promise<void> => {
    if (selectedProjectCanisterId !== undefined) {
      loading = true;
      await Promise.all([
        syncSnsNeurons(selectedProjectCanisterId),
        loadSnsAccounts({ rootCanisterId: selectedProjectCanisterId }),
      ]);
      loading = false;
    }
  };

  $: syncNeuronsForProject($snsOnlyProjectStore);

  let summary: SnsSummary | undefined;
  $: summary = $snsProjectSelectedStore?.summary;

  let tableNeurons: TableNeuron[] = [];
  $: tableNeurons = nonNullish(summary)
    ? tableNeuronsFromSnsNeurons({
        universe: $pageStore.universe,
        token: summary.token,
        identity: $authStore.identity,
        i18n: $i18n,
        snsNeurons: $definedSnsNeuronStore,
        icpSwapUsdPrices: $icpSwapUsdPricesStore,
        ledgerCanisterId: summary.ledgerCanisterId,
      })
    : [];

  let isTokenPriceKnown: boolean;
  $: isTokenPriceKnown =
    nonNullish($icpSwapUsdPricesStore) &&
    $icpSwapUsdPricesStore !== "error" &&
    nonNullish(summary) &&
    summary.ledgerCanisterId.toText() in $icpSwapUsdPricesStore;

  let totalStakeInUsd: number | undefined;
  $: totalStakeInUsd = isTokenPriceKnown
    ? getTotalStakeInUsd(tableNeurons)
    : undefined;

  $: claimNextNeuronIfNeeded({
    rootCanisterId: $snsOnlyProjectStore,
    neurons:
      $snsOnlyProjectStore &&
      $snsNeuronsStore[$snsOnlyProjectStore.toText()]?.neurons,
  });
</script>

<div class="wrapper" data-tid="sns-neurons-component">
  {#if loading}
    <Spinner />
  {:else if tableNeurons.length > 0}
    {#if $ENABLE_USD_VALUES_FOR_NEURONS}
      <UsdValueBanner
        usdAmount={totalStakeInUsd}
        hasUnpricedTokens={!isTokenPriceKnown}
      >
        <IconNeuronsPage slot="icon" />
      </UsdValueBanner>
    {/if}
    <NeuronsTable neurons={tableNeurons} />
  {:else if nonNullish(summary)}
    <EmptyMessage
      >{replacePlaceholders($i18n.sns_neurons.text, {
        $project: summary.metadata.name,
        $tokenSymbol: summary.token.symbol,
      })}</EmptyMessage
    >
  {/if}
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>

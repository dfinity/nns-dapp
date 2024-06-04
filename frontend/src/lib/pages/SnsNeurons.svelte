<script lang="ts">
  import { ENABLE_NEURONS_TABLE } from "$lib/stores/feature-flags.store";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import {
    sortedSnsCFNeuronsStore,
    sortedSnsUserNeuronsStore,
  } from "$lib/derived/sns/sns-sorted-neurons.derived";
  import { i18n } from "$lib/stores/i18n";
  import { authStore } from "$lib/stores/auth.store";
  import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
  import SnsNeuronCard from "$lib/components/sns-neurons/SnsNeuronCard.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";
  import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { SnsSummary } from "$lib/types/sns";
  import { nonNullish } from "@dfinity/utils";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import { Html, Spinner } from "@dfinity/gix-components";
  import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { tableNeuronsFromSnsNeurons } from "$lib/utils/neurons-table.utils";

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

  const buildNeuronDetailsUrl = (neuron: SnsNeuron): string => {
    const neuronId = getSnsNeuronIdAsHexString(neuron);
    return buildNeuronUrl({
      universe: $pageStore.universe,
      neuronId,
    });
  };

  let empty: boolean;
  $: empty =
    $sortedSnsUserNeuronsStore.length === 0 &&
    $sortedSnsCFNeuronsStore.length === 0;

  let summary: SnsSummary | undefined;
  $: summary = $snsProjectSelectedStore?.summary;

  let tableNeurons: TableNeuron[] = [];
  $: tableNeurons =
    $ENABLE_NEURONS_TABLE && nonNullish(summary)
      ? tableNeuronsFromSnsNeurons({
          universe: $pageStore.universe,
          token: summary.token,
          identity: $authStore.identity,
          i18n: $i18n,
          snsNeurons: $snsNeuronsStore[$pageStore.universe]?.neurons ?? [],
        })
      : [];
</script>

<TestIdWrapper testId="sns-neurons-component">
  {#if $ENABLE_NEURONS_TABLE}
    {#if loading}
      <Spinner />
    {:else if tableNeurons.length > 0}
      <NeuronsTable neurons={tableNeurons} />
    {/if}
  {:else}
    {#if $sortedSnsUserNeuronsStore.length > 0 || loading}
      <div class="card-grid" data-tid="sns-neurons-body">
        {#if loading}
          <SkeletonCard />
          <SkeletonCard />
        {:else}
          {#each $sortedSnsUserNeuronsStore as neuron (getSnsNeuronIdAsHexString(neuron))}
            <SnsNeuronCard
              {neuron}
              ariaLabel={$i18n.neurons.aria_label_neuron_card}
              href={buildNeuronDetailsUrl(neuron)}
            />
          {/each}
        {/if}
      </div>
    {/if}

    {#if $sortedSnsCFNeuronsStore.length > 0}
      <h2
        data-tid="community-fund-title"
        class={$sortedSnsUserNeuronsStore.length > 0 ? "top-margin" : ""}
      >
        {$i18n.sns_neuron_detail.community_fund_section}
      </h2>
      <p data-tid="community-fund-description" class="bottom-margin">
        <Html
          text={$i18n.sns_neuron_detail.community_fund_section_description}
        />
      </p>
      <div class="card-grid" data-tid="fund-neurons-grid">
        {#each $sortedSnsCFNeuronsStore as neuron (getSnsNeuronIdAsHexString(neuron))}
          <SnsNeuronCard
            {neuron}
            ariaLabel={$i18n.neurons.aria_label_neuron_card}
            href={buildNeuronDetailsUrl(neuron)}
          />
        {/each}
      </div>
    {/if}
  {/if}

  {#if !loading && empty && nonNullish(summary)}
    <EmptyMessage
      >{replacePlaceholders($i18n.sns_neurons.text, {
        $project: summary.metadata.name,
        $tokenSymbol: summary.token.symbol,
      })}</EmptyMessage
    >
  {/if}
</TestIdWrapper>

<style lang="scss">
  .top-margin {
    margin-top: var(--padding-4x);
  }
  .bottom-margin {
    margin-bottom: var(--padding-4x);
  }
</style>

<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import {
    sortedSnsCFNeuronsStore,
    sortedSnsUserNeuronsStore,
  } from "$lib/derived/sns/sns-sorted-neurons.derived";
  import { i18n } from "$lib/stores/i18n";
  import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
  import SnsNeuronCard from "$lib/components/sns-neurons/SnsNeuronCard.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { SnsSummary } from "$lib/types/sns";
  import { nonNullish } from "@dfinity/utils";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import { Html } from "@dfinity/gix-components";

  let loading = true;

  const syncNeuronsForProject = async (
    selectedProjectCanisterId: Principal | undefined
  ): Promise<void> => {
    if (selectedProjectCanisterId !== undefined) {
      loading = true;
      await Promise.all([
        syncSnsNeurons(selectedProjectCanisterId),
        syncSnsAccounts({ rootCanisterId: selectedProjectCanisterId }),
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
    })
  };

  let empty: boolean;
  $: empty =
    $sortedSnsUserNeuronsStore.length === 0 &&
    $sortedSnsCFNeuronsStore.length === 0;

  let summary: SnsSummary | undefined;
  $: summary = $snsProjectSelectedStore?.summary;
</script>

<TestIdWrapper testId="sns-neurons-component">
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
      <Html text={$i18n.sns_neuron_detail.community_fund_section_description} />
    </p>
    <div class="card-grid">
      {#each $sortedSnsCFNeuronsStore as neuron (getSnsNeuronIdAsHexString(neuron))}
        <SnsNeuronCard
          {neuron}
          ariaLabel={$i18n.neurons.aria_label_neuron_card}
          href={buildNeuronDetailsUrl(neuron)}
        />
      {/each}
    </div>
  {/if}

  {#if !loading && empty && nonNullish(summary)}
    <EmptyMessage
      >{replacePlaceholders($i18n.sns_neurons.text, {
        $project: summary.metadata.name,
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

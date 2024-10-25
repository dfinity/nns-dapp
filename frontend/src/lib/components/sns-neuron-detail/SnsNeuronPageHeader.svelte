<script lang="ts">
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { onIntersection } from "$lib/directives/intersection.directives";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import PageHeader from "../common/PageHeader.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import UniverseSummary from "../universe/UniverseSummary.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { isNullish, nonNullish, type Token } from "@dfinity/utils";
  import { getContext } from "svelte";
  import NeuronNavigation from "../neuron-detail/NeuronNavigation.svelte";
  import { snsNeuronsTableOrderSortedNeuronIdsStore } from "$lib/stores/sns-neurons-table-order-sorted-neuron-ids-store";

  export let token: Token;

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  const updateLayoutTitle = ($event: Event) => {
    const {
      detail: { intersecting },
    } = $event as unknown as CustomEvent<IntersectingDetail>;

    const neuronId = nonNullish(neuron)
      ? getSnsNeuronIdAsHexString(neuron)
      : undefined;

    layoutTitleStore.set({
      title: $i18n.neuron_detail.title,
      header:
        intersecting || isNullish(neuronId)
          ? $i18n.neuron_detail.title
          : `${token.symbol} - ${shortenWithMiddleEllipsis(neuronId)}`,
    });
  };

  let neuronIds: string[] = [];
  $: neuronIds = $snsNeuronsTableOrderSortedNeuronIdsStore;
</script>

<PageHeader testId="sns-neuron-page-header-component">
  <UniverseSummary slot="start" universe={$selectedUniverseStore} />
  <span
    slot="end"
    class="description header-end"
    data-tid="neuron-id-element"
    use:onIntersection
    on:nnsIntersecting={updateLayoutTitle}
  >
    {#if nonNullish(neuron)}
      <IdentifierHash identifier={getSnsNeuronIdAsHexString(neuron)} />
    {/if}
  </span>

  <div slot="navigation">
    {#if nonNullish(neuron)}
      <NeuronNavigation
        currentNeuronId={getSnsNeuronIdAsHexString(neuron)}
        {neuronIds}
      />
    {/if}
  </div>
</PageHeader>

<style lang="scss">
  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniverseSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>

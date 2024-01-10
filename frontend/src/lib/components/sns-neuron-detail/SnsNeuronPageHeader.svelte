<script lang="ts">
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getContext } from "svelte";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import { isNullish, nonNullish, type Token } from "@dfinity/utils";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import PageHeader from "../common/PageHeader.svelte";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { i18n } from "$lib/stores/i18n";
  import { onIntersection } from "$lib/directives/intersection.directives";

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
</script>

<PageHeader testId="sns-neuron-page-header-component">
  <UniversePageSummary slot="start" universe={$selectedUniverseStore} />
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
</PageHeader>

<style lang="scss">
  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniversePageSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>

<script lang="ts">
  import { MAX_NEURON_ID_DIGITS } from "$lib/constants/neurons.constants";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import { onIntersection } from "$lib/directives/intersection.directives";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import PageHeader from "../common/PageHeader.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import UniverseSummary from "../universe/UniverseSummary.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import NeuronNavigation from "./NeuronNavigation.svelte";
  import { neuronsTableOrderSortedNeuronIdsStore } from "$lib/stores/neurons-table-order-sorted-neuron-ids-store";

  export let neuron: NeuronInfo;

  const updateLayoutTitle = ($event: Event) => {
    const {
      detail: { intersecting },
    } = $event as unknown as CustomEvent<IntersectingDetail>;

    layoutTitleStore.set({
      title: $i18n.neuron_detail.title,
      header: intersecting
        ? $i18n.neuron_detail.title
        : `${$i18n.core.icp} – ${neuron.neuronId}`,
    });
  };
</script>

<PageHeader testId="nns-neuron-page-header-component">
  <UniverseSummary slot="start" universe={$nnsUniverseStore} />
  <div slot="end">
    <span
      class="description header-end"
      data-tid="neuron-id-element"
      use:onIntersection
      on:nnsIntersecting={updateLayoutTitle}
    >
      <IdentifierHash
        identifier={neuron.neuronId.toString()}
        splitLength={MAX_NEURON_ID_DIGITS / 2}
      />
    </span>
  </div>
  <div slot="navigation">
    <NeuronNavigation
      currentNeuronId={neuron.neuronId.toString()}
      neuronIds={$neuronsTableOrderSortedNeuronIdsStore}
    />
  </div>
</PageHeader>

<style lang="scss">
  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniverseSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>

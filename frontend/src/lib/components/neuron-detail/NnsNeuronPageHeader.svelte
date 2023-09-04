<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import { MAX_NEURON_ID_DIGITS } from "$lib/constants/neurons.constants";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";
  import PageHeader from "../common/PageHeader.svelte";
  import { onIntersection } from "$lib/directives/intersection.directives";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import type { IntersectingDetail } from "$lib/types/intersection.types";

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
  <UniversePageSummary slot="start" universe={NNS_UNIVERSE} />
  <span
    slot="end"
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
</PageHeader>

<style lang="scss">
  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniversePageSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>

<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import { MAX_NEURON_ID_DIGITS } from "$lib/constants/neurons.constants";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";
  import PageHeader from "../common/PageHeader.svelte";

  export let neuron: NeuronInfo;
</script>

<PageHeader testId="nns-neuron-page-header-component">
  <UniversePageSummary slot="start" universe={NNS_UNIVERSE} />
  <span slot="end" class="description header-end">
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

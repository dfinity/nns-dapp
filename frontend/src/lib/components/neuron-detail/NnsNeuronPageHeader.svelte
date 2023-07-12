<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import { MAX_NEURON_ID_DIGITS } from "$lib/constants/neurons.constants";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";

  export let neuron: NeuronInfo;
</script>

<div class="container" data-tid="nns-neuron-page-header-component">
  <UniversePageSummary universe={NNS_UNIVERSE} />
  <span class="description header-end">
    <IdentifierHash
      identifier={neuron.neuronId.toString()}
      splitLength={MAX_NEURON_ID_DIGITS / 2}
    />
  </span>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    justify-content: center;
    align-items: center;

    @include media.min-width(medium) {
      flex-direction: row;
      justify-content: space-between;
    }

    .header-end {
      // The IdentifierHash has the copy button at the end which has some extra padding.
      // This is needed to align in the center the UniversePageSummary and the IdentifierHash in mobile view.
      padding-left: var(--padding-1_5x);
    }
  }
</style>

<script lang="ts">
  import { IconLeft, IconRight } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import type { UniverseCanisterIdText } from "$lib/types/universe";

  export let currentNeuronId: string;
  export let currentUniverse: UniverseCanisterIdText;
  export let neuronIds: string[] = [];
  export let selectNeuron: (
    id: string,
    universe: UniverseCanisterIdText
  ) => void;

  let currentIndex: number;
  let previousId: string | undefined;
  let nextId: string | undefined;

  $: {
    currentIndex = neuronIds.indexOf(currentNeuronId);
    previousId = currentIndex > 0 ? neuronIds[currentIndex - 1] : undefined;
    nextId =
      currentIndex < neuronIds.length - 1
        ? neuronIds[currentIndex + 1]
        : undefined;
  }

  const selectPrevious = () => {
    if (previousId) {
      selectNeuron(previousId, currentUniverse);
    }
  };
  const selectNext = () => {
    if (nextId) {
      selectNeuron(nextId, currentUniverse);
    }
  };
</script>

<div
  class="neuron-nav"
  class:dont-display={isNullish(previousId) && isNullish(nextId)}
  role="toolbar"
  data-tid="neuron-navigation"
>
  <button
    class="icon-only previous"
    type="button"
    aria-label={$i18n.neuron_detail.previous}
    on:click={selectPrevious}
    class:hidden={isNullish(previousId)}
    data-tid="neuron-navigation-previous"
    data-test-neuron-id={previousId ?? ""}
  >
    <IconLeft />
  </button>
  <button
    class="icon-only next"
    type="button"
    aria-label={$i18n.neuron_detail.next}
    on:click={selectNext}
    class:hidden={isNullish(nextId)}
    data-tid="neuron-navigation-next"
    data-test-neuron-id={nextId ?? ""}
  >
    <IconRight />
  </button>
</div>

<style lang="scss">
  .neuron-nav {
    color: var(--elements-icons);
  }

  .dont-display {
    display: none;
  }

  button {
    &.hidden {
      visibility: hidden;
      opacity: 0;
    }
  }
</style>

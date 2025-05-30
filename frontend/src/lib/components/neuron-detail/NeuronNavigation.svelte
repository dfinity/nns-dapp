<script lang="ts">
  import { IconLeft, IconRight } from "@dfinity/gix-components";
  import { nonNullish, isNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { pageStore } from "$lib/derived/page.derived";
  import { AppPath } from "$lib/constants/routes.constants";

  export let currentNeuronId: string;
  export let neuronIds: string[] = [];

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

  const getNeuronHref = (id: string | undefined) => {
    return nonNullish(id)
      ? `${AppPath.Neuron}/?u=${$pageStore.universe}&neuron=${id}`
      : "";
  };
</script>

{#if nonNullish(previousId) || nonNullish(nextId)}
  <div class="neuron-nav" role="toolbar" data-tid="neuron-navigation">
    <a
      class="previous"
      title={$i18n.neuron_detail.previous}
      href={getNeuronHref(previousId)}
      class:hidden={isNullish(previousId)}
      data-tid="neuron-navigation-previous"
      data-test-neuron-id={previousId ?? ""}
    >
      <IconLeft />
    </a>
    <a
      class="next"
      title={$i18n.neuron_detail.next}
      href={getNeuronHref(nextId)}
      class:hidden={isNullish(nextId)}
      data-tid="neuron-navigation-next"
      data-test-neuron-id={nextId ?? ""}
    >
      <IconRight />
    </a>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .neuron-nav {
    display: flex;
    align-items: center;
    column-gap: var(--padding);
    color: var(--elements-icons);
    // This gap is not possible to apply to the parent component because it's needed only when the NeuronNavigation is rendered.
    margin-bottom: var(--padding-3x);
    @include media.min-width(medium) {
      margin-bottom: 0;
      margin-left: var(--padding);
    }
  }

  a {
    display: flex;
    align-items: center;

    &.hidden {
      visibility: hidden;
    }
  }
</style>

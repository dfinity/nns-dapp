<script lang="ts">
  import { ICON_SIZE_SMALL_PIXELS } from "$lib/constants/layout.constants";
  import { i18n } from "$lib/stores/i18n";
  import { getStateInfo, type StateInfo } from "$lib/utils/neuron.utils";
  import { keyOf } from "$lib/utils/utils";
  import type { NeuronState } from "@dfinity/nns";

  export let state: NeuronState;

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(state);
</script>

{#if stateInfo !== undefined}
  <div class="status" data-tid="neuron-state-info">
    <svelte:component this={stateInfo.Icon} size={ICON_SIZE_SMALL_PIXELS} />
    {keyOf({ obj: $i18n.neuron_state, key: stateInfo.textKey })}
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .status {
    display: inline-flex;
    gap: var(--padding-0_5x);
    align-items: center;

    border-radius: var(--border-radius-0_5x);

    @include fonts.small;

    :global(svg) {
      color: var(--tertiary);
    }
  }
</style>

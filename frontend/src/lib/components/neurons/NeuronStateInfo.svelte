<script lang="ts">
  import { i18n } from "$lib/stores/i18n";

  import type { StateInfo } from "$lib/utils/neuron.utils";
  import { NeuronState } from "@dfinity/nns";
  import { getStateInfo } from "$lib/utils/neuron.utils";
  import { keyOf } from "$lib/utils/utils";

  export let state: NeuronState;

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(state);
</script>

{#if stateInfo !== undefined}
  <div class="status">
    <svelte:component this={stateInfo.Icon} />
    {keyOf({ obj: $i18n.neuron_state, key: NeuronState[state] })}
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";

  .status {
    display: inline-flex;
    gap: var(--padding-0_5x);
    align-items: center;

    border-radius: var(--border-radius-0_5x);
    padding: var(--padding) var(--padding-2x) var(--padding) var(--padding);

    @include fonts.small;

    :global(svg) {
      color: var(--tertiary)
    }
  }
</style>

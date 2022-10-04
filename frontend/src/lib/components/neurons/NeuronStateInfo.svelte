<script lang="ts">
  import { i18n } from "$lib/stores/i18n";

  import type { StateInfo } from "$lib/utils/neuron.utils";
  import { NeuronState } from "@dfinity/nns";
  import { getStateInfo } from "$lib/utils/neuron.utils";

  export let state: NeuronState;

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(state);

  let iconStyle: string;
  $: iconStyle =
    stateInfo?.color !== undefined ? `color: ${stateInfo.color};` : "";
</script>

{#if stateInfo !== undefined}
  <div class="info">
    <p style={iconStyle} class="status">
      {$i18n.neuron_state[NeuronState[state]]}
      <svelte:component this={stateInfo.Icon} />
    </p>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/display";

  .status {
    display: inline-flex;
    color: var(--value-color);

    :global {
      svg {
        margin-left: var(--padding-0_5x);
      }
    }
  }

  .info {
    @include display.space-between;
    align-items: center;

    p {
      margin: 0;
    }
  }
</style>

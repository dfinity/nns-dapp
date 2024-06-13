<script lang="ts">
  import { ICON_SIZE_SMALL_PIXELS } from "$lib/constants/layout.constants";
  import { i18n } from "$lib/stores/i18n";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import type { StateInfo } from "$lib/utils/neuron.utils";
  import { getStateInfo } from "$lib/utils/neuron.utils";
  import { Tooltip } from "@dfinity/gix-components";
  import { NeuronState } from "@dfinity/nns";

  export let rowData: TableNeuron;

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(rowData.state);
</script>

{#if stateInfo !== undefined}
  <Tooltip
    testId="neuron-state-cell-component"
    id="spawning-neuron-{rowData.neuronId}"
    text={rowData.state === NeuronState.Spawning
      ? $i18n.neuron_detail.spawning_neuron_info
      : undefined}
  >
    <div class="status" data-tid="neuron-state-info">
      <svelte:component this={stateInfo.Icon} size={ICON_SIZE_SMALL_PIXELS} />
      {$i18n.neuron_state[stateInfo.textKey]}
    </div>
  </Tooltip>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .status {
    display: flex;
    gap: var(--padding-0_5x);
    align-items: center;
  }
</style>

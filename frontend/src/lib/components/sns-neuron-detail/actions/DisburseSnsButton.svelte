<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import VestingTooltipWrapper from "../VestingTooltipWrapper.svelte";
  import { isVesting } from "$lib/utils/sns-neuron.utils";

  export let neuron: SnsNeuron;
</script>

<VestingTooltipWrapper {neuron}>
  <button
    class="secondary"
    disabled={isVesting(neuron)}
    on:click={() => openSnsNeuronModal({ type: "disburse" })}
    data-tid="disburse-button">{$i18n.neuron_detail.disburse}</button
  >
</VestingTooltipWrapper>

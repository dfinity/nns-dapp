<script lang="ts">
  import VestingTooltipWrapper from "$lib/components/sns-neuron-detail/VestingTooltipWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import { isVesting } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";

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

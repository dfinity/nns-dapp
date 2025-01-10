<script lang="ts">
  import VestingTooltipWrapper from "$lib/components/sns-neuron-detail/VestingTooltipWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import { getSnsNeuronState, isVesting } from "$lib/utils/sns-neuron.utils";
  import { NeuronState } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: SnsNeuron;

  let isUnlocked: boolean;
  $: isUnlocked = getSnsNeuronState(neuron) === NeuronState.Dissolved;
</script>

<VestingTooltipWrapper {neuron}>
  <button
    class="secondary"
    disabled={isVesting(neuron)}
    data-tid="sns-increase-dissolve-delay"
    on:click={() => openSnsNeuronModal({ type: "increase-dissolve-delay" })}
    >{isUnlocked
      ? $i18n.neurons.set_dissolve_delay
      : $i18n.neuron_detail.increase_dissolve_delay}</button
  >
</VestingTooltipWrapper>

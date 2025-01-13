<script lang="ts">
  import VestingTooltipWrapper from "$lib/components/sns-neuron-detail/VestingTooltipWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import { getSnsNeuronState, isVesting } from "$lib/utils/sns-neuron.utils";
  import { keyOf } from "$lib/utils/utils";
  import { NeuronState } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: SnsNeuron;
  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);

  let isDissolving: boolean;
  let buttonKey: string;
  $: {
    isDissolving = neuronState === NeuronState.Dissolving;
    buttonKey = isDissolving ? "stop_dissolving" : "start_dissolving";
  }
</script>

<VestingTooltipWrapper {neuron}>
  <button
    on:click={() => openSnsNeuronModal({ type: "dissolve" })}
    disabled={isVesting(neuron)}
    class="secondary"
    data-tid="sns-dissolve-button"
    >{keyOf({ obj: $i18n.neuron_detail, key: buttonKey })}</button
  >
</VestingTooltipWrapper>

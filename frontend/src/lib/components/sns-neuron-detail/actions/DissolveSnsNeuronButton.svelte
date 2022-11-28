<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { keyOf } from "$lib/utils/utils";
  import {SELECTED_SNS_NEURON_CONTEXT_KEY, type SelectedSnsNeuronContext} from "$lib/types/sns-neuron-detail.context";
  import {getContext} from "svelte";

  export let neuronState: NeuronState;

  let isDissolving: boolean;
  let buttonKey: string;
  $: {
    isDissolving = neuronState === NeuronState.Dissolving;
    buttonKey = isDissolving ? "stop_dissolving" : "start_dissolving";
  }

  const { toggleModal }: SelectedSnsNeuronContext =
          getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
</script>

<button on:click={() => toggleModal("dissolve")} class="secondary" data-tid="sns-dissolve-button"
  >{keyOf({ obj: $i18n.neuron_detail, key: buttonKey })}</button
>

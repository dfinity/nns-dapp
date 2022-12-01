<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { keyOf } from "$lib/utils/utils";
  import {openSnsNeuronModal} from "$lib/utils/modals.utils";

  export let neuronState: NeuronState;

  let isDissolving: boolean;
  let buttonKey: string;
  $: {
    isDissolving = neuronState === NeuronState.Dissolving;
    buttonKey = isDissolving ? "stop_dissolving" : "start_dissolving";
  }
</script>

<button
  on:click={() => openSnsNeuronModal({type: "dissolve"})}
  class="secondary"
  data-tid="sns-dissolve-button"
  >{keyOf({ obj: $i18n.neuron_detail, key: buttonKey })}</button
>

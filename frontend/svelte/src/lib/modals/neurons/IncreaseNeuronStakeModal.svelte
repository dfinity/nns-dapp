<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { reloadNeuron } from "../../services/neurons.services";
  import NewTransactionModal from "../accounts/NewTransactionModal.svelte";

  export let neuron: NeuronInfo;

  const fetchUpdatedNeuron = () => reloadNeuron(neuron);
</script>

<NewTransactionModal
  on:nnsClose
  onTransactionComplete={fetchUpdatedNeuron}
  destinationAddress={neuron.fullNeuron?.accountIdentifier}
/>

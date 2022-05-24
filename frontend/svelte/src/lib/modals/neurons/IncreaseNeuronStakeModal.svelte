<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { loadNeuron } from "../../services/neurons.services";
  import { neuronsStore } from "../../stores/neurons.store";
  import NewTransactionModal from "../accounts/NewTransactionModal.svelte";

  export let neuron: NeuronInfo;

  // Not resolve until the neuron has been loaded
  const fetchUpdatedNeuron = () =>
    new Promise<void>((resolve) => {
      loadNeuron({
        neuronId: neuron.neuronId,
        forceFetch: true,
        strategy: "update",
        setNeuron: ({ neuron, certified }) => {
          neuronsStore.pushNeurons({ neurons: [neuron], certified });
          resolve();
        },
        handleError: () => {
          console.log("in da error");
          resolve();
        },
      });
    });
</script>

<NewTransactionModal
  on:nnsClose
  onTransactionComplete={fetchUpdatedNeuron}
  destinationAddress={neuron.fullNeuron?.accountIdentifier}
/>

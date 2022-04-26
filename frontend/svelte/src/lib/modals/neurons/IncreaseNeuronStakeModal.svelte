<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { loadNeuron } from "../../services/neurons.services";
  import { neuronsStore } from "../../stores/neurons.store";
  import NewTransactionModal from "../accounts/NewTransactionModal.svelte";

  export let neuron: NeuronInfo;

  const dispatcher = createEventDispatcher();
  const fetchUpdatedNeuron = async () => {
    await loadNeuron({
      neuronId: neuron.neuronId,
      forceFetch: true,
      setNeuron: ({ neuron, certified }) => {
        neuronsStore.pushNeurons({ neurons: [neuron], certified });
      },
    });
    dispatcher("nnsClose");
  };
</script>

<NewTransactionModal
  on:nnsClose={fetchUpdatedNeuron}
  selectedDestination={neuron.fullNeuron?.accountIdentifier}
/>

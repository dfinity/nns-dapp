<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { reloadNeuron } from "../../services/neurons.services";
  import NewTransactionModal from "../accounts/NewTransactionModal.svelte";
  import type { TransactionStore } from "../../types/transaction.context";
  import { MIN_NEURON_STAKE } from "../../constants/neurons.constants";
  import { toastsStore } from "../../stores/toasts.store";
  export let neuron: NeuronInfo;

  const fetchUpdatedNeuron = () => reloadNeuron(neuron.neuronId);

  const checkAmount = ({ amount }: TransactionStore): boolean => {
    const amountE8s = amount?.toE8s() ?? BigInt(0);
    const neuronStakeE8s = neuron.fullNeuron?.cachedNeuronStake ?? BigInt(0);
    if (amountE8s + neuronStakeE8s < MIN_NEURON_STAKE) {
      toastsStore.error({
        labelKey: "error.amount_not_enough_top_up_neuron",
      });
      return false;
    }
    return true;
  };
</script>

<NewTransactionModal
  on:nnsClose
  validateTransaction={checkAmount}
  onTransactionComplete={fetchUpdatedNeuron}
  destinationAddress={neuron.fullNeuron?.accountIdentifier}
/>

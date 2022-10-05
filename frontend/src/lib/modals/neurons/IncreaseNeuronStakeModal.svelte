<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { reloadNeuron } from "$lib/services/neurons.services";
  import NewTransactionModal from "$lib/components/modals/accounts/NewTransactionModal.svelte";
  import type { TransactionStore } from "$lib/types/transaction.context";
  import { MIN_NEURON_STAKE } from "$lib/constants/neurons.constants";
  import { toastsError } from "$lib/stores/toasts.store";
  export let neuron: NeuronInfo;

  const fetchUpdatedNeuron = () => reloadNeuron(neuron.neuronId);

  const checkAmount = ({ amount }: TransactionStore): boolean => {
    const amountE8s = amount?.toE8s() ?? BigInt(0);
    const neuronStakeE8s = neuron.fullNeuron?.cachedNeuronStake ?? BigInt(0);
    if (amountE8s + neuronStakeE8s < MIN_NEURON_STAKE) {
      toastsError({
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

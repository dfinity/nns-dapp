<script lang="ts">
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { stakeMaturity } from "$lib/services/neurons.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";

  export let neuron: NeuronInfo;

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const stakeNeuronMaturity = async ({
    detail: { percentageToStake },
  }: CustomEvent<{ percentageToStake: number }>) => {
    const { neuronId } = neuron;

    startBusyNeuron({ initiator: "stake-maturity", neuronId });

    const { success } = await stakeMaturity({
      neuronId,
      percentageToStake,
    });

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.stake_maturity_success",
      });
      close();
    }

    stopBusy("stake-maturity");
  };
</script>

<StakeMaturityModal
  availableMaturityE8s={neuron.fullNeuron?.maturityE8sEquivalent ?? 0n}
  on:nnsStakeMaturity={stakeNeuronMaturity}
  on:nnsClose
/>

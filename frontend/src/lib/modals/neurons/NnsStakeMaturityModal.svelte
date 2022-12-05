<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { stopBusy } from "$lib/stores/busy.store";
  import { stakeMaturity } from "$lib/services/neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import { formattedMaturity } from "$lib/utils/neuron.utils";

  export let neuron: NeuronInfo;

  let maturity: string;
  $: maturity = formattedMaturity(neuron);

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
  formattedMaturity={maturity}
  on:nnsStakeMaturity={stakeNeuronMaturity}
  on:nnsClose
/>

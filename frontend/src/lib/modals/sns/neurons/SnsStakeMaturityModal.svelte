<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import { formattedMaturity } from "$lib/utils/sns-neuron.utils";

  export let neuron: SnsNeuron;

  let maturity: string;
  $: maturity = formattedMaturity(neuron);

  const stakeNeuronMaturity = async ({
    detail: { percentageToStake },
  }: CustomEvent<{ percentageToStake: number }>) => {
    /**
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
         */
  };
</script>

<StakeMaturityModal
  formattedMaturity={maturity}
  on:nnsStakeMaturity={stakeNeuronMaturity}
  on:nnsClose
/>

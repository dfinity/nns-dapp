<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { stopBusy } from "$lib/stores/busy.store";
  import { mergeMaturity, stakeMaturity } from "$lib/services/neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import {
    formattedMaturity,
    isNeuronControlledByHardwareWallet,
  } from "$lib/utils/neuron.utils";
  import { createEventDispatcher } from "svelte";
  import { accountsStore } from "$lib/stores/accounts.store";

  export let neuron: NeuronInfo;

  let maturity: string;
  $: maturity = formattedMaturity(neuron);

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const stakeNeuronMaturity = async ({
    detail: { percentageToStake },
  }: CustomEvent<{ percentageToStake: number }>) => {
    const { neuronId } = neuron;
    const controlledByHardwareWallet = isNeuronControlledByHardwareWallet({
      neuron,
      accounts: $accountsStore,
    });

    startBusyNeuron({ initiator: "stake-maturity", neuronId });

    const { success } = await (controlledByHardwareWallet
      ? // Temprorary solution (call mergeMaturity for HW, but the backend does stake) because Ledger doesn't support staking yet.
        // If Ledger includes the Staking Maturity transaction in the next version, this workaround can be removed. And the same flow for HW and non-HW can be used.
        mergeMaturity({
          neuronId,
          percentageToMerge: percentageToStake,
        })
      : stakeMaturity({
          neuronId,
          percentageToStake,
        }));

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

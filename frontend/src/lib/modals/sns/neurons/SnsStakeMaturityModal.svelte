<script lang="ts">
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import { stakeMaturity } from "$lib/services/sns-neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import { createEventDispatcher } from "svelte";

  export let neuron: SnsNeuron;
  export let neuronId: SnsNeuronId;
  export let rootCanisterId: Principal;
  export let reloadNeuron: () => Promise<void>;

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const stakeNeuronMaturity = async ({
    detail: { percentageToStake },
  }: CustomEvent<{ percentageToStake: number }>) => {
    startBusy({ initiator: "stake-maturity" });

    const { success } = await stakeMaturity({
      neuronId,
      percentageToStake,
      rootCanisterId,
    });

    await reloadNeuron();

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
  availableMaturityE8s={neuron.maturity_e8s_equivalent}
  on:nnsStakeMaturity={stakeNeuronMaturity}
  on:nnsClose
/>

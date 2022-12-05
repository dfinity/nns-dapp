<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import { formattedMaturity } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuronId } from "@dfinity/sns";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import { stakeMaturity } from "$lib/services/sns-neurons.services";
  import { Principal } from "@dfinity/principal";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";

  export let neuron: SnsNeuron;
  export let neuronId: SnsNeuronId;

  let maturity: string;
  $: maturity = formattedMaturity(neuron);

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const stakeNeuronMaturity = async ({
    detail: { percentageToStake },
  }: CustomEvent<{ percentageToStake: number }>) => {
    startBusy({ initiator: "stake-maturity" });

    const rootCanisterId: Principal = $snsOnlyProjectStore as Principal;

    const { success } = await stakeMaturity({
      neuronId,
      percentageToStake,
      rootCanisterId,
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

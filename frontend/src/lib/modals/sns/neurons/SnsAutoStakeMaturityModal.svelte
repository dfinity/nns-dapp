<script lang="ts">
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import AutoStakeMaturityModal from "$lib/modals/neurons/AutoStakeMaturityModal.svelte";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import { hasAutoStakeMaturityOn } from "$lib/utils/sns-neuron.utils";
  import { toggleAutoStakeMaturity } from "$lib/services/sns-neurons.services";
  import type { Principal } from "@dfinity/principal";

  export let neuron: SnsNeuron;
  export let neuronId: SnsNeuronId;
  export let rootCanisterId: Principal;
  export let reloadNeuron: () => Promise<void>;

  let hasAutoStakeOn: boolean;
  $: hasAutoStakeOn = hasAutoStakeMaturityOn(neuron);

  const autoStake = async () => {
    startBusy({ initiator: "auto-stake-maturity" });

    const { success } = await toggleAutoStakeMaturity({
      neuron,
      neuronId,
      rootCanisterId,
    });

    await reloadNeuron();

    if (success) {
      toastsSuccess({
        labelKey: `neuron_detail.auto_stake_maturity_${
          hasAutoStakeOn ? "on" : "off"
        }_success`,
      });
    }

    closeModal();
    stopBusy("auto-stake-maturity");
  };

  const dispatcher = createEventDispatcher();
  const closeModal = () => dispatcher("nnsClose");
</script>

<AutoStakeMaturityModal
  {hasAutoStakeOn}
  on:nnsClose
  on:nnsConfirm={autoStake}
/>

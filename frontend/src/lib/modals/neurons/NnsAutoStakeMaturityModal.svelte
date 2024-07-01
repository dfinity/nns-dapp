<script lang="ts">
  import AutoStakeMaturityModal from "$lib/modals/neurons/AutoStakeMaturityModal.svelte";
  import { toggleAutoStakeMaturity } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { hasAutoStakeMaturityOn } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";

  export let neuron: NeuronInfo;

  let hasAutoStakeOn: boolean;
  $: hasAutoStakeOn = hasAutoStakeMaturityOn(neuron);

  const autoStake = async () => {
    startBusy({ initiator: "auto-stake-maturity" });
    const labelKey = `neuron_detail.auto_stake_maturity_${
      hasAutoStakeOn ? "off" : "on"
    }_success`;

    const { success } = await toggleAutoStakeMaturity(neuron);

    if (success) {
      toastsSuccess({
        labelKey,
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

<script lang="ts">
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toggleAutoStakeMaturity } from "$lib/services/neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NeuronInfo } from "@dfinity/nns";
  import { hasAutoStakeMaturityOn } from "$lib/utils/neuron.utils";
  import { createEventDispatcher } from "svelte";
  import AutoStakeMaturityModal from "$lib/modals/neurons/AutoStakeMaturityModal.svelte";

  export let neuron: NeuronInfo;

  let hasAutoStakeOn: boolean;
  $: hasAutoStakeOn = hasAutoStakeMaturityOn(neuron);

  const autoStake = async () => {
    startBusy({ initiator: "auto-stake-maturity" });

    const { success } = await toggleAutoStakeMaturity(neuron);

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

<script lang="ts">
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import { Html } from "@dfinity/gix-components";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toggleAutoStakeMaturity } from "$lib/services/neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NeuronInfo } from "@dfinity/nns";
  import { hasAutoStakeMaturityOn } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from "svelte";

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

<ConfirmationModal on:nnsClose={closeModal} on:nnsConfirm={autoStake}>
  <div data-tid="auto-stake-confirm-modal" class="wrapper">
    <h4>{$i18n.core.confirm}</h4>
    <p>
      <Html
        text={hasAutoStakeOn
          ? $i18n.neuron_detail.auto_stake_maturity_off
          : $i18n.neuron_detail.auto_stake_maturity_on}
      />
    </p>
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../themes/mixins/confirmation-modal";

  .wrapper {
    @include confirmation-modal.wrapper;
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
  }
</style>

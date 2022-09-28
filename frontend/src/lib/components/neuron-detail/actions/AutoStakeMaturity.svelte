<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import ConfirmationModal from "../../../modals/ConfirmationModal.svelte";
  import { toggleCommunityFund } from "../../../services/neurons.services";
  import { startBusy, stopBusy } from "../../../stores/busy.store";
  import { i18n } from "../../../stores/i18n";
  import { toastsSuccess } from "../../../stores/toasts.store";
  import { hasJoinedCommunityFund } from "../../../utils/neuron.utils";
  import Checkbox from "../../ui/Checkbox.svelte";

  export let neuron: NeuronInfo;

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);

  let isOpen: boolean = false;

  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  const joinFund = async () => {
    startBusy({ initiator: "auto-stake-maturity" });
    const successMessageKey = isCommunityFund
      ? "neuron_detail.leave_community_fund_success"
      : "neuron_detail.join_community_fund_success";
    const id = await toggleCommunityFund(neuron);
    if (id !== undefined) {
      toastsSuccess({
        labelKey: successMessageKey,
      });
    }
    closeModal();
    stopBusy("auto-stake-maturity");
  };
</script>

<div class="auto-stake">
  <Checkbox
    preventDefault
    inputId="auto-stake-maturity-checkbox"
    checked={isCommunityFund}
    on:nnsChange={showModal}
  >
    <span>{$i18n.neuron_detail.auto_stake_maturity}</span>
  </Checkbox>
</div>

{#if isOpen}
  <ConfirmationModal on:nnsClose={closeModal} on:nnsConfirm={joinFund}>
    <div data-tid="join-community-fund-modal" class="wrapper">
      <h4>{$i18n.core.confirm}</h4>
      {#if isCommunityFund}
        <p>{@html $i18n.neuron_detail.auto_stake_maturity_on}</p>
      {:else}
        <p>{@html $i18n.neuron_detail.auto_stake_maturity_off}</p>
      {/if}
    </div>
  </ConfirmationModal>
{/if}

<style lang="scss">
  @use "../../../themes/mixins/confirmation-modal";

  .auto-stake {
    padding: var(--padding-2x) 0 0;

    --select-label-order: 1;
    --select-padding: var(--padding) 0;
  }

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

<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import ConfirmationModal from "../../../modals/ConfirmationModal.svelte";
  import { joinCommunityFund } from "../../../services/neurons.services";
  import { startBusy, stopBusy } from "../../../stores/busy.store";
  import { i18n } from "../../../stores/i18n";
  import { toastsStore } from "../../../stores/toasts.store";

  export let neuronId: NeuronId;

  let isOpen: boolean = false;

  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  const joinFund = async () => {
    startBusy({ initiator: "join-community-fund" });
    const id = await joinCommunityFund(neuronId);
    if (id !== undefined) {
      toastsStore.success({
        labelKey: "neuron_detail.join_community_fund_success",
      });
    }
    closeModal();
    stopBusy("join-community-fund");
  };
</script>

<button
  data-tid="join-community-fund-button"
  class="primary small"
  on:click={showModal}>{$i18n.neuron_detail.join_community_fund}</button
>
{#if isOpen}
  <ConfirmationModal on:nnsClose={closeModal} on:nnsConfirm={joinFund}>
    <div data-tid="join-community-fund-modal">
      <h4>{$i18n.core.confirm}</h4>
      <p>{$i18n.neuron_detail.join_community_fund_description}</p>
    </div>
  </ConfirmationModal>
{/if}

<style lang="scss">
  @use "../../../themes/mixins/confirmation-modal.scss";
  div {
    @include confirmation-modal.wrapper;
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
  }
</style>

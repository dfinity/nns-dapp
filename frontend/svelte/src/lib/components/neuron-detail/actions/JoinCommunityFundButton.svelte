<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import ConfirmationModal from "../../../modals/ConfirmationModal.svelte";
  import { joinCommunityFund } from "../../../services/neurons.services";
  import { startBusy, stopBusy } from "../../../stores/busy.store";
  import { i18n } from "../../../stores/i18n";
  import { toastsStore } from "../../../stores/toasts.store";

  export let neuronId: NeuronId;
  export let disabled: boolean = false;

  let isOpen: boolean = false;

  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  const joinFund = async () => {
    startBusy("join-community-fund");
    try {
      await joinCommunityFund(neuronId);
      toastsStore.show({
        labelKey: "neuron_detail.join_community_fund_success",
        level: "info",
      });
      closeModal();
    } catch (err) {
      toastsStore.error({
        labelKey: "error.join_community_fund",
        err,
      });
    } finally {
      stopBusy("join-community-fund");
    }
  };
</script>

<button
  data-tid="join-community-fund-button"
  {disabled}
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

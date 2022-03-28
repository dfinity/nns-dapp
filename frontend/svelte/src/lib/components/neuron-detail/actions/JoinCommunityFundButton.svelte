<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import ConfirmationModal from "../../../modals/ConfirmationModal.svelte";
  import { joinCommunityFund } from "../../../services/neurons.services";
  import { busyStore } from "../../../stores/busy.store";
  import { i18n } from "../../../stores/i18n";
  import { toastsStore } from "../../../stores/toasts.store";

  export let neuronId: NeuronId;
  export let disabled: boolean = false;

  let isOpen: boolean = false;

  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  const joinFund = async () => {
    busyStore.start("join-community-fund");
    try {
      await joinCommunityFund(neuronId);
      toastsStore.show({
        labelKey: "neuron_detail.join_community_fund_success",
        level: "info",
      });
    } catch (err) {
      toastsStore.error({
        labelKey: "error.join_community_fund",
        err,
      });
    } finally {
      busyStore.stop("join-community-fund");
      closeModal();
    }
  };
</script>

<button {disabled} class="primary small" on:click={showModal}
  >{$i18n.neuron_detail.join_community_fund}</button
>
{#if isOpen}
  <ConfirmationModal on:nnsClose={closeModal} on:nnsConfirm={joinFund}>
    <div>
      <h4>{$i18n.core.confirm}</h4>
      <p>{$i18n.neuron_detail.join_community_fund_description}</p>
    </div>
  </ConfirmationModal>
{/if}

<style lang="scss">
  div {
    padding-bottom: calc(2 * var(--padding));

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: calc(1.5 * var(--padding));

    color: var(--background-contrast);
  }

  h4 {
    margin: 0;
    font-size: var(--font-size-h3);
  }

  p {
    margin: 0;

    font-size: var(--font-size-h4);
    text-align: center;
  }
</style>

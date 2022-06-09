<script lang="ts">
  import { getContext } from "svelte";
  import type { CanisterDetails } from "../../canisters/ic-management/ic-management.canister.types";
  import ConfirmationModal from "../../modals/ConfirmationModal.svelte";
  import { removeController } from "../../services/canisters.services";
  import { authStore } from "../../stores/auth.store";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../types/canister-detail.context";
  import { isUserController } from "../../utils/canisters.utils";

  export let controller: string;

  const { store, reloadDetails }: CanisterDetailsContext =
    getContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY);

  let userController: boolean;
  $: userController = isUserController({
    controller,
    authStore: $authStore,
  });
  let lastController: boolean;
  $: lastController = $store.details?.settings.controllers.length === 1;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
  const remove = async () => {
    const canisterDetails: CanisterDetails | undefined = $store.details;
    if (canisterDetails === undefined) {
      // Edge case
      toastsStore.error({
        labelKey: "error.unknown",
      });
      return;
    }
    startBusy({ initiator: "remove-controller-canister" });
    const { success } = await removeController({
      controller,
      canisterDetails,
    });
    if (success) {
      await reloadDetails(canisterDetails.id);
    }
    stopBusy("remove-controller-canister");
    closeModal();
  };
</script>

<button
  class="text"
  aria-label={$i18n.core.remove}
  on:click={openModal}
  data-tid="remove-canister-controller-button"
>
  x
</button>

{#if showModal}
  <ConfirmationModal on:nnsClose={closeModal} on:nnsConfirm={remove}>
    <div data-tid="remove-canister-controller-confirmation-modal">
      <h4>{$i18n.canister_detail.confirm_remove_controller_title}</h4>
      {#if userController}
        <p>
          {$i18n.canister_detail.confirm_remove_controller_user_description_1}
        </p>
        <p>
          {$i18n.canister_detail.confirm_remove_controller_user_description_2}
        </p>
      {:else}
        <p>{$i18n.canister_detail.confirm_remove_controller_description}</p>
        <p>{controller}</p>
      {/if}
      {#if lastController}
        <p>
          {$i18n.canister_detail.confirm_remove_last_controller_description}
        </p>
      {/if}
    </div>
  </ConfirmationModal>
{/if}

<style lang="scss">
  @use "../../themes/mixins/confirmation-modal.scss";

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

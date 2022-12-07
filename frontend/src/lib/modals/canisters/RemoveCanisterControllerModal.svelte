<script lang="ts">
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import { toastsError } from "$lib/stores/toasts.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { removeController } from "$lib/services/canisters.services";
  import { createEventDispatcher, getContext } from "svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { isUserController } from "$lib/utils/canisters.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";

  export let controller: string;

  let userController: boolean;
  $: userController = isUserController({
    controller,
    authStore: $authStore,
  });

  const { store, reloadDetails }: CanisterDetailsContext =
    getContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY);

  let lastController: boolean;
  $: lastController = $store.details?.settings.controllers.length === 1;

  const dispatcher = createEventDispatcher();

  const remove = async () => {
    const canisterDetails: CanisterDetails | undefined = $store.details;
    if (canisterDetails === undefined || controller === undefined) {
      // Edge case
      toastsError({
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

    dispatcher("nnsClose");
  };
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm={remove}>
  <div data-tid="remove-canister-controller-confirmation-modal">
    <h4>{$i18n.canister_detail.confirm_remove_controller_title}</h4>
    {#if userController}
      <p class="description">
        {$i18n.canister_detail.confirm_remove_controller_user_description_1}
      </p>
      <p class="description">
        {$i18n.canister_detail.confirm_remove_controller_user_description_2}
      </p>
    {:else}
      <p class="description">
        {$i18n.canister_detail.confirm_remove_controller_description}
      </p>
      <p class="value">{controller ?? ""}</p>
    {/if}
    {#if lastController}
      <p class="description">
        {$i18n.canister_detail.confirm_remove_last_controller_description}
      </p>
    {/if}
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../themes/mixins/confirmation-modal";

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

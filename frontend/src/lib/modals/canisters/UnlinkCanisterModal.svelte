<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { detachCanister } from "$lib/services/canisters.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import type { Principal } from "@dfinity/principal";
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { createEventDispatcher } from "svelte";

  export let canisterId: Principal;

  const dispatch = createEventDispatcher();

  const detach = async () => {
    startBusy({
      initiator: "unlink-canister",
    });

    const { success } = await detachCanister(canisterId);

    stopBusy("unlink-canister");

    dispatch("nnsClose");

    if (success) {
      toastsSuccess({
        labelKey: "canister_detail.unlink_success",
      });

      await goto(AppPath.Canisters, { replaceState: true });
    }
  };
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm={detach}>
  <div data-tid="unlink-canister-confirmation-modal">
    <h4>{$i18n.canister_detail.confirm_unlink_title}</h4>
    <p class="description">
      {$i18n.canister_detail.confirm_unlink_description_1}
    </p>
    <p class="description">
      {$i18n.canister_detail.confirm_unlink_description_2}
    </p>
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

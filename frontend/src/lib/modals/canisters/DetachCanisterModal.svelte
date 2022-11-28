<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { detachCanister } from "$lib/services/canisters.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { Principal } from "@dfinity/principal";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import {createEventDispatcher} from "svelte";

  export let canisterId: Principal;

  const dispatch = createEventDispatcher();

  const detach = async () => {
    startBusy({
      initiator: "detach-canister",
    });

    const { success } = await detachCanister(canisterId);

    stopBusy("detach-canister");

    dispatch("nnsClose");

    if (success) {
      toastsSuccess({
        labelKey: "canister_detail.detach_success",
      });

      await goto(AppPath.Canisters, { replaceState: true });
    }
  };
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm={detach}>
  <div data-tid="detach-canister-confirmaation-modal">
    <h4>{$i18n.canister_detail.confirm_detach_title}</h4>
    <p class="description">
      {$i18n.canister_detail.confirm_detach_description_1}
    </p>
    <p class="description">
      {$i18n.canister_detail.confirm_detach_description_2}
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

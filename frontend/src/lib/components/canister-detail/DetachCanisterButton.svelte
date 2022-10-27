<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { AppPath } from "$lib/constants/routes.constants";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import { detachCanister } from "$lib/services/canisters.services";
  import { busy, startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { goto } from "$app/navigation";

  export let canisterId: Principal;

  let showConfirmation = false;
  const openConfirmation = () => (showConfirmation = true);
  const close = () => (showConfirmation = false);

  const detach = async () => {
    startBusy({
      initiator: "detach-canister",
    });
    const { success } = await detachCanister(canisterId);
    stopBusy("detach-canister");
    close();
    if (success) {
      toastsSuccess({
        labelKey: "canister_detail.detach_success",
      });

      await goto(AppPath.Canisters, { replaceState: true });
    }
  };
</script>

<button
  class="primary"
  type="button"
  on:click={openConfirmation}
  disabled={$busy}
  data-tid="detach-canister-button"
>
  {$i18n.canister_detail.detach}
</button>

{#if showConfirmation}
  <ConfirmationModal on:nnsClose={close} on:nnsConfirm={detach}>
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
{/if}

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

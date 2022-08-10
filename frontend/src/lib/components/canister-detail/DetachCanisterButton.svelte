<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { AppPath } from "../../constants/routes.constants";
  import ConfirmationModal from "../../modals/ConfirmationModal.svelte";
  import { detachCanister } from "../../services/canisters.services";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import { toastsStore } from "../../stores/toasts.store";

  export let canisterId: Principal;

  let showConfirmation: boolean = false;
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
      toastsStore.success({
        labelKey: "canister_detail.detach_success",
      });
      routeStore.replace({ path: AppPath.Canisters });
    }
  };
</script>

<button
  class="primary small"
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

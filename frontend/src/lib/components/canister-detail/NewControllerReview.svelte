<script lang="ts">
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher, getContext } from "svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../types/canister-detail.context";
  import { toastsStore } from "../../stores/toasts.store";
  import type { CanisterDetails } from "../../canisters/ic-management/ic-management.canister.types";
  import { addController } from "../../services/canisters.services";
  import FooterModal from "../../modals/FooterModal.svelte";

  export let controller: Principal;

  const { store, reloadDetails }: CanisterDetailsContext =
    getContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY);

  const dispatcher = createEventDispatcher();
  const add = async () => {
    const canisterDetails: CanisterDetails | undefined = $store.details;
    if (canisterDetails === undefined) {
      // Edge case
      toastsStore.error({
        labelKey: "error.unknown",
      });
      return;
    }
    const controllerString = controller.toText();
    startBusy({ initiator: "add-controller-canister" });
    const { success } = await addController({
      controller: controllerString,
      canisterDetails,
    });
    if (success) {
      await reloadDetails(canisterDetails.id);
    }
    stopBusy("add-controller-canister");
    // Leave it open in case the error can help fix the problem
    if (success) {
      dispatcher("nnsClose");
    }
  };
</script>

<form
  on:submit|preventDefault={add}
  class="wizard-wrapper"
  data-tid="new-controller-review-screen"
>
  <div>
    <h5>{$i18n.canisters.canister_id}</h5>
    <p>{$store.details?.id.toText()}</p>
    <h5>{$i18n.canister_detail.new_controller}</h5>
    <p>{controller.toText()}</p>
  </div>
  <FooterModal>
    <button
      class="secondary small"
      type="button"
      on:click={() => dispatcher("nnsBack")}
    >
      {$i18n.canister_detail.edit_controller}
    </button>
    <button
      class="primary small"
      type="submit"
      disabled={$busy}
      data-tid="confirm-new-canister-controller-button"
    >
      {$i18n.accounts.confirm_and_send}
    </button>
  </FooterModal>
</form>

<style lang="scss">
  div {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  p {
    margin-bottom: var(--padding-3x);
  }
</style>

<script lang="ts">
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher, getContext } from "svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import { addController } from "$lib/services/canisters.services";

  export let controller: Principal;

  const { store, reloadDetails }: CanisterDetailsContext =
    getContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY);

  const dispatcher = createEventDispatcher();
  const add = async () => {
    const canisterDetails: CanisterDetails | undefined = $store.details;
    if (canisterDetails === undefined) {
      // Edge case
      toastsError({
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

<form on:submit|preventDefault={add} data-tid="new-controller-review-screen">
  <div>
    <p class="label">{$i18n.canisters.canister_id}</p>
    <p class="value">{$store.details?.id.toText()}</p>
  </div>

  <div>
    <p class="label">{$i18n.canister_detail.new_controller}</p>
    <p class="value">{controller.toText()}</p>
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      on:click={() => dispatcher("nnsBack")}
    >
      {$i18n.canister_detail.edit_controller}
    </button>
    <button
      class="primary"
      type="submit"
      disabled={$busy}
      data-tid="confirm-new-canister-controller-button"
    >
      {$i18n.accounts.confirm_and_send}
    </button>
  </div>
</form>

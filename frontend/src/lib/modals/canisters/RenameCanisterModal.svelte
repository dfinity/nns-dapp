<script lang="ts">
  import TextInputForm from "$lib/components/common/TextInputForm.svelte";
  import { MAX_CANISTER_NAME_LENGTH } from "$lib/constants/canisters.constants";
  import { renameCanister } from "$lib/services/canisters.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { errorCanisterNameMessage } from "$lib/utils/canisters.utils";
  import { Modal, busy } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { createEventDispatcher, getContext } from "svelte";

  const { store }: CanisterDetailsContext = getContext<CanisterDetailsContext>(
    CANISTER_DETAILS_CONTEXT_KEY
  );

  let currentName = $store.info?.name;

  const dispatch = createEventDispatcher();
  const rename = async () => {
    const canisterId = $store.info?.canister_id;
    // For type safety reasons. If the modal is open, the canister id is set in the store of the context.
    if (nonNullish(canisterId)) {
      startBusy({
        initiator: "rename-canister",
      });
      const { success } = await renameCanister({
        canisterId,
        // For type safety reasons. Button is disabled if `currentName` is nullish or ""
        name: currentName ?? "",
      });

      stopBusy("rename-canister");

      if (success) {
        dispatch("nnsClose");
        toastsSuccess({
          labelKey: "canister_detail.rename_success",
          substitutions: { $name: currentName ?? "" },
        });
      }
    }
  };
</script>

<Modal on:nnsClose testId="rename-canister-modal-component">
  <svelte:fragment slot="title"
    ><span>{$i18n.canister_detail.rename_canister}</span></svelte:fragment
  >

  <TextInputForm
    testId="rename-canister-form"
    on:nnsConfirmText={rename}
    on:nnsClose
    bind:text={currentName}
    placeholderLabelKey="canister_detail.rename_canister_placeholder"
    disabledInput={$busy}
    disabledConfirm={$busy ||
      (nonNullish(currentName) &&
        currentName.length > MAX_CANISTER_NAME_LENGTH)}
    errorMessage={errorCanisterNameMessage(currentName)}
    required={false}
  >
    <svelte:fragment slot="label"
      >{$i18n.canister_detail.rename_canister_title}</svelte:fragment
    >
    <svelte:fragment slot="cancel-text">{$i18n.core.cancel}</svelte:fragment>
    <svelte:fragment slot="confirm-text"
      >{$i18n.canister_detail.rename}</svelte:fragment
    >
  </TextInputForm>
</Modal>

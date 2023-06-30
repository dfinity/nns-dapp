<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal, busy } from "@dfinity/gix-components";
  import TextInputForm from "$lib/components/common/TextInputForm.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { getContext } from "svelte";
  import { isNullish } from "@dfinity/utils";

  const { store }: CanisterDetailsContext = getContext<CanisterDetailsContext>(
    CANISTER_DETAILS_CONTEXT_KEY
  );

  let currentName = $store.info?.name;

  const rename = () => {
    console.log("renaming", currentName);
  };
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title"
    ><span>{$i18n.canister_detail.rename_canister}</span></svelte:fragment
  >

  <TextInputForm
    on:nnsConfirmText={rename}
    on:nnsClose
    bind:text={currentName}
    placeholderLabelKey="canister_detail.rename_canister_placeholder"
    busy={$busy}
    disabledConfirm={isNullish(currentName) ||
      currentName?.length === 0 ||
      $busy}
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

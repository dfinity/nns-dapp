<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext } from "svelte";
  import { addSubAccount } from "$lib/services/accounts.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { busy } from "@dfinity/gix-components";
  import {
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "$lib/types/add-account.context";
  import TextInputScreen from "../common/TextInputScreen.svelte";

  let newAccountName = "";

  const context: AddAccountContext = getContext<AddAccountContext>(
    ADD_ACCOUNT_CONTEXT_KEY
  );

  const { back }: AddAccountContext = context;

  let dispatcher = createEventDispatcher();

  const createNewSubAccount = async () => {
    startBusy({ initiator: "accounts" });

    await addSubAccount({
      name: newAccountName,
    });

    stopBusy("accounts");

    dispatcher("nnsClose");
  };
</script>

<TextInputScreen
  testId="add-sub-account-component"
  on:nnsConfirmText={createNewSubAccount}
  on:nnsClose={back}
  bind:text={newAccountName}
  placeholderLabelKey="accounts.new_linked_account_placeholder"
  busy={$busy}
  disabledConfirm={newAccountName.length === 0 || $busy}
>
  <svelte:fragment slot="label"
    >{$i18n.accounts.new_linked_account_enter_name}</svelte:fragment
  >
  <svelte:fragment slot="cancel-text">{$i18n.core.back}</svelte:fragment>
  <svelte:fragment slot="confirm-text">{$i18n.core.create}</svelte:fragment>
</TextInputScreen>

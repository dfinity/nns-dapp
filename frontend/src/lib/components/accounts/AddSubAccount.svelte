<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext } from "svelte";
  import { addSubAccount } from "$lib/services/accounts.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { busy } from "@dfinity/gix-components";
  import {
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "$lib/types/add-account.context";

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

<form on:submit|preventDefault={createNewSubAccount}>
  <div>
    <p class="label">{$i18n.accounts.new_linked_account_enter_name}</p>
    <Input
      inputType="text"
      placeholderLabelKey="accounts.new_linked_account_placeholder"
      name="newAccount"
      bind:value={newAccountName}
      disabled={$busy}
    />
  </div>

  <div class="toolbar">
    <button class="secondary" type="button" on:click={back} data-tid="back">
      {$i18n.core.back}
    </button>
    <button
      class="primary"
      type="submit"
      disabled={newAccountName.length === 0 || $busy}
    >
      {$i18n.core.create}
    </button>
  </div>
</form>

<style lang="scss">
  .label {
    margin: 0;
  }
</style>

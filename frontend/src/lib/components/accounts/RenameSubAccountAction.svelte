<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext } from "svelte";
  import { renameSubAccount } from "$lib/services/accounts.services";
  import { busy, startBusy, stopBusy } from "$lib/stores/busy.store";
  import type { Account } from "$lib/types/account";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "$lib/types/selected-account.context";

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );
  let selectedAccount: Account | undefined;
  $: selectedAccount = $store.account;

  let newAccountName = $store.account?.name ?? "";

  let dispatcher = createEventDispatcher();

  const createNewSubAccount = async () => {
    startBusy({ initiator: "accounts" });

    await renameSubAccount({
      newName: newAccountName,
      selectedAccount,
    });

    stopBusy("accounts");

    dispatcher("nnsClose");
  };
</script>

<form on:submit|preventDefault={createNewSubAccount}>
  <div>
    <p class="label">{$i18n.accounts.rename_account_enter_new_name}</p>
    <Input
      inputType="text"
      placeholderLabelKey="accounts.rename_new_name_placeholder"
      name="newAccountName"
      bind:value={newAccountName}
      disabled={$busy}
    />
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      on:click={() => dispatcher("nnsClose")}
    >
      {$i18n.core.cancel}
    </button>
    <button
      class="primary"
      type="submit"
      data-tid="rename-subaccount-button"
      disabled={newAccountName.length === 0 ||
        $busy ||
        selectedAccount === undefined}
    >
      {$i18n.accounts.rename}
    </button>
  </div>
</form>

<style lang="scss">
  .label {
    margin: 0;
  }
</style>

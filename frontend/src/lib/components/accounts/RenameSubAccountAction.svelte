<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext } from "svelte";
  import { renameSubAccount } from "$lib/services/accounts.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { busy } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import TextInputForm from "../common/TextInputForm.svelte";

  const { store } = getContext<WalletContext>(WALLET_CONTEXT_KEY);
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

<TextInputForm
  on:nnsConfirmText={createNewSubAccount}
  on:nnsClose
  bind:text={newAccountName}
  placeholderLabelKey="accounts.rename_new_name_placeholder"
  disabledInput={$busy}
  disabledConfirm={newAccountName.length === 0 ||
    $busy ||
    selectedAccount === undefined}
>
  <svelte:fragment slot="label"
    >{$i18n.accounts.rename_account_enter_new_name}</svelte:fragment
  >
  <svelte:fragment slot="cancel-text">{$i18n.core.cancel}</svelte:fragment>
  <svelte:fragment slot="confirm-text">{$i18n.accounts.rename}</svelte:fragment>
</TextInputForm>

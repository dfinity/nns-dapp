<script lang="ts">
  import Input from "../ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher, getContext } from "svelte";
  import { renameSubAccount } from "../../services/accounts.services";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import type { Account } from "../../types/account";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "../../types/selected-account.context";
  import FooterModal from "../../modals/FooterModal.svelte";

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );
  let selectedAccount: Account | undefined;
  $: selectedAccount = $store.account;

  let newAccountName: string = $store.account?.name ?? "";

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

<form on:submit|preventDefault={createNewSubAccount} class="wizard-wrapper">
  <div>
    <h4 class="balance">{$i18n.accounts.rename_account_enter_new_name}</h4>
    <Input
      inputType="text"
      placeholderLabelKey="accounts.rename_new_name_placeholder"
      name="newAccountName"
      bind:value={newAccountName}
      disabled={$busy}
    />
  </div>
  <FooterModal>
    <button
      class="secondary small"
      type="button"
      on:click={() => dispatcher("nnsClose")}
    >
      {$i18n.core.cancel}
    </button>
    <button
      class="primary small"
      type="submit"
      data-tid="rename-subaccount-button"
      disabled={newAccountName.length === 0 ||
        $busy ||
        selectedAccount === undefined}
    >
      {$i18n.accounts.rename}
    </button>
  </FooterModal>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal";

  form {
    @include modal.wizard-single-input-form;
  }
</style>

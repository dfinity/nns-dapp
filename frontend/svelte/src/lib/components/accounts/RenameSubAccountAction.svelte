<script lang="ts">
  import Input from "../ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";
  import { renameSubAccount } from "../../services/accounts.services";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import type { Account } from "../../types/account";

  export let selectedAccount: Account | undefined;

  let newAccountName: string = "";

  let dispatcher = createEventDispatcher();

  const createNewSubAccount = async () => {
    startBusy("accounts");

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
      theme="dark"
      disabled={$busy}
    />
  </div>
  <button
    class="primary full-width"
    type="submit"
    disabled={newAccountName.length === 0 ||
      $busy ||
      selectedAccount === undefined}
  >
    {$i18n.accounts.rename}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  form {
    @include modal.wizard-single-input-form;
  }
</style>

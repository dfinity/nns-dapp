<script lang="ts">
  import Input from "../ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";
  import { addSubAccount } from "../../services/accounts.services";
  import {
    NameTooLongError,
    SubAccountLimitExceededError,
  } from "../../canisters/nns-dapp/nns-dapp.errors";
  import { toastsStore } from "../../stores/toasts.store";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";

  let newAccountName: string = "";

  let dispatcher = createEventDispatcher();

  const createNewAccount = async () => {
    try {
      startBusy("accounts");
      await addSubAccount({
        name: newAccountName,
      });
      dispatcher("nnsClose");
    } catch (err) {
      const labelKey =
        err instanceof NameTooLongError
          ? "create_subaccount_too_long"
          : err instanceof SubAccountLimitExceededError
          ? "create_subaccount_limit_exceeded"
          : "create_subaccount";
      toastsStore.error({
        labelKey,
        err,
      });
    } finally {
      stopBusy("accounts");
    }
  };
</script>

<form on:submit|preventDefault={createNewAccount} class="wizard-wrapper">
  <div>
    <h4 class="balance">{$i18n.accounts.new_linked_account_title}</h4>
    <Input
            inputType="text"
            placeholderLabelKey="accounts.new_linked_account_placeholder"
            name="newAccount"
            bind:value={newAccountName}
            theme="dark"
            disabled={$busy}
    />
  </div>
  <button
          class="primary full-width"
          type="submit"
          disabled={newAccountName.length === 0 || $busy}
  >
    {$i18n.core.create}
  </button>
</form>

<style lang="scss">
  form {
    --input-width: 100%;

    div {
      // push button to the bottom
      flex-grow: 1;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
</style>

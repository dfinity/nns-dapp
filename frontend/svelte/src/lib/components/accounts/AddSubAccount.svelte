<script lang="ts">
  import Input from "../ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";
  import { addSubAccount } from "../../services/accounts.services";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";

  let newAccountName: string = "";

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

<form on:submit|preventDefault={createNewSubAccount} class="wizard-wrapper">
  <div>
    <h4 class="balance">{$i18n.accounts.new_linked_account_enter_name}</h4>
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
  @use "../../themes/mixins/modal.scss";

  form {
    @include modal.wizard-single-input-form;
  }
</style>

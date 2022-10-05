<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext } from "svelte";
  import { addSubAccount } from "$lib/services/accounts.services";
  import { busy, startBusy, stopBusy } from "$lib/stores/busy.store";
  import FooterModal from "$lib/components/modals/FooterModal.svelte";
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

<form on:submit|preventDefault={createNewSubAccount} class="wizard-wrapper">
  <div>
    <h4 class="balance">{$i18n.accounts.new_linked_account_enter_name}</h4>
    <Input
      inputType="text"
      placeholderLabelKey="accounts.new_linked_account_placeholder"
      name="newAccount"
      bind:value={newAccountName}
      disabled={$busy}
    />
  </div>
  <FooterModal>
    <button class="secondary" type="button" on:click={back}>
      {$i18n.core.back}
    </button>
    <button
      class="primary"
      type="submit"
      disabled={newAccountName.length === 0 || $busy}
    >
      {$i18n.core.create}
    </button>
  </FooterModal>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal";

  form {
    @include modal.wizard-single-input-form;
  }
</style>

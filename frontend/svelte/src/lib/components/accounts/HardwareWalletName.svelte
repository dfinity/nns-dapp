<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import Input from "../ui/Input.svelte";
  import {
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "../../stores/add-account.store";
  import { getContext } from "svelte";

  const context: AddAccountContext = getContext<AddAccountContext>(
    ADD_ACCOUNT_CONTEXT_KEY
  );

  const { store, next }: AddAccountContext = context;

  let hardwareWalletName: string = $store.hardwareWalletName ?? "";

  // TODO(L2-433): display error hint - needs UI/UX decision about the display of such hint next to input first
  let disabled: boolean;
  $: disabled = hardwareWalletName.length < 2;

  const onSubmit = () => {
    store.update((data) => ({
      ...data,
      hardwareWalletName,
    }));

    next?.();
  };
</script>

<form on:submit|preventDefault={onSubmit} class="wizard-wrapper">
  <div>
    <h4 class="balance">{$i18n.accounts.attach_hardware_enter_name}</h4>
    <Input
      inputType="text"
      placeholderLabelKey="accounts.attach_hardware_name_placeholder"
      name="walletName"
      bind:value={hardwareWalletName}
      theme="dark"
    />
  </div>
  <button class="primary full-width" type="submit" {disabled}>
    {$i18n.core.continue}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  form {
    @include modal.wizard-single-input-form;
  }
</style>

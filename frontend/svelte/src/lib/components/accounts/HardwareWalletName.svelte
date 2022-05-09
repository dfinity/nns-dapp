<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import {
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "../../stores/add-account.store";
  import { getContext } from "svelte";
  import InputWithError from "../ui/InputWithError.svelte";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { HARDWARE_WALLET_NAME_MIN_LENGTH } from "../../constants/accounts.constants";

  const context: AddAccountContext = getContext<AddAccountContext>(
    ADD_ACCOUNT_CONTEXT_KEY
  );

  const { store, next }: AddAccountContext = context;

  let hardwareWalletName: string = $store.hardwareWalletName ?? "";

  const invalidInputLength = (): boolean =>
    hardwareWalletName.length < HARDWARE_WALLET_NAME_MIN_LENGTH;

  let disabled: boolean;
  $: hardwareWalletName, (() => (disabled = invalidInputLength()))();

  let invalidInput: boolean = false;

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
    <h4>{$i18n.accounts.attach_hardware_enter_name}</h4>
    <InputWithError
      inputType="text"
      placeholderLabelKey="accounts.attach_hardware_name_placeholder"
      name="walletName"
      bind:value={hardwareWalletName}
      theme="dark"
      on:blur={() => (invalidInput = invalidInputLength())}
      errorMessage={invalidInput
        ? replacePlaceholders($i18n.error.input_length, {
            $length: `${HARDWARE_WALLET_NAME_MIN_LENGTH}`,
          })
        : undefined}
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

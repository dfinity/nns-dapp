<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "$lib/types/add-account.context";
  import { getContext } from "svelte";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { HARDWARE_WALLET_NAME_MIN_LENGTH } from "$lib/constants/accounts.constants";

  const context: AddAccountContext = getContext<AddAccountContext>(
    ADD_ACCOUNT_CONTEXT_KEY
  );

  const { store, next, back }: AddAccountContext = context;

  let hardwareWalletName = $store.hardwareWalletName ?? "";

  const invalidInputLength = (): boolean =>
    hardwareWalletName.length < HARDWARE_WALLET_NAME_MIN_LENGTH;

  let disabled: boolean;
  $: hardwareWalletName, (() => (disabled = invalidInputLength()))();

  // We display the error message only if at least one character has been entered
  const showInvalidInputLength = () =>
    (invalidInputMessage =
      hardwareWalletName.length > 0 && invalidInputLength());
  let invalidInputMessage = false;

  const onSubmit = () => {
    store.update((data) => ({
      ...data,
      hardwareWalletName,
    }));

    next?.();
  };
</script>

<form on:submit|preventDefault={onSubmit}>
  <div>
    <p class="label">{$i18n.accounts.attach_hardware_enter_name}</p>
    <InputWithError
      inputType="text"
      placeholderLabelKey="accounts.attach_hardware_name_placeholder"
      name="walletName"
      bind:value={hardwareWalletName}
      on:blur={showInvalidInputLength}
      errorMessage={invalidInputMessage
        ? replacePlaceholders($i18n.error.input_length, {
            $length: `${HARDWARE_WALLET_NAME_MIN_LENGTH}`,
          })
        : undefined}
    />
  </div>

  <div class="toolbar">
    <button class="secondary" type="button" on:click={back}>
      {$i18n.core.back}
    </button>
    <button class="primary" type="submit" {disabled}>
      {$i18n.core.continue}
    </button>
  </div>
</form>

<style lang="scss">
  .label {
    margin: 0;
    padding-bottom: var(--padding);
  }
</style>

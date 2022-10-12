<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { ACCOUNT_ADDRESS_MIN_LENGTH } from "$lib/constants/accounts.constants";
  import { i18n } from "$lib/stores/i18n";
  import { invalidAddress } from "$lib/utils/accounts.utils";

  import InputWithError from "$lib/components/ui/InputWithError.svelte";

  export let address = "";

  let showError = false;
  const dispatcher = createEventDispatcher();
  const showErrorIfAny = () => {
    showError = address.length > 0 && invalidAddress(address);
    dispatcher("nnsBlur");
  };
  // Hide error on change
  $: address, (showError = false);
</script>

<InputWithError
  inputType="text"
  placeholderLabelKey="accounts.address"
  name="accounts-address"
  bind:value={address}
  minLength={ACCOUNT_ADDRESS_MIN_LENGTH}
  errorMessage={showError ? $i18n.error.address_not_valid : undefined}
  on:blur={showErrorIfAny}><slot name="label" slot="label" /></InputWithError
>

<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../../constants/accounts.constants";
  import { i18n } from "../../stores/i18n";
  import { invalidAddress } from "../../utils/accounts.utils";

  import InputWithError from "../ui/InputWithError.svelte";

  export let address: string = "";

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
  on:blur={showErrorIfAny}
/>

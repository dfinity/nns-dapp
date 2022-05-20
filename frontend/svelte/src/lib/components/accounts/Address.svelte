<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../../constants/accounts.constants";
  import { invalidAddress } from "../../utils/accounts.utils";
  import InputWithError from "../ui/InputWithError.svelte";

  export let address: string = "";

  let showError = false;
  const showErrorIfAny = () => {
    showError = address.length > 0 && invalidAddress(address);
  };
  // Hide error on change
  $: address, (showError = false);
</script>

<article>
  <form on:submit|preventDefault>
    <InputWithError
      inputType="text"
      placeholderLabelKey="accounts.address"
      name="accounts-address"
      bind:value={address}
      minLength={ACCOUNT_ADDRESS_MIN_LENGTH}
      theme="dark"
      errorMessage={showError ? $i18n.error.address_not_valid : undefined}
      on:blur={showErrorIfAny}
    />
    <button
      class="primary small"
      type="submit"
      data-tid="address-submit-button"
      disabled={invalidAddress(address)}
    >
      {$i18n.core.continue}
    </button>
  </form>
</article>

<style lang="scss">
  article {
    margin-bottom: var(--padding-2x);
    padding: 0 0 var(--padding-2x);
  }

  form {
    display: flex;
    flex-direction: column;
  }
</style>

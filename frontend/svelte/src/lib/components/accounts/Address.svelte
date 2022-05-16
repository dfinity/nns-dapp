<script lang="ts">
  import Input from "../ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../../constants/accounts.constants";
  import { invalidAddress } from "../../utils/accounts.utils";

  export let address: string = "";
  // TODO: Validate valid address on blur https://dfinity.atlassian.net/browse/L2-479
</script>

<article>
  <form on:submit|preventDefault>
    <Input
      inputType="text"
      placeholderLabelKey="accounts.address"
      name="accounts-address"
      bind:value={address}
      minLength={ACCOUNT_ADDRESS_MIN_LENGTH}
      theme="dark"
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

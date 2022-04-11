<script lang="ts">
  import Input from "../ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../../constants/accounts.constants";
  import { invalidAddress } from "../../utils/accounts.utils";

  export let address: string = "";
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
      disabled={invalidAddress(address)}
    >
      {$i18n.core.continue}
    </button>
  </form>
</article>

<style lang="scss">
  article {
    margin-bottom: calc(2 * var(--padding));
    padding: 0 0 calc(2 * var(--padding));
  }

  form {
    display: flex;
    flex-direction: column;
  }
</style>

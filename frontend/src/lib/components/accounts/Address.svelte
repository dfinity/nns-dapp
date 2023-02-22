<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { invalidAddress } from "$lib/utils/accounts.utils";
  import AddressInput from "./AddressInput.svelte";

  export let address = "";
</script>

<article>
  <form on:submit|preventDefault>
    <AddressInput bind:address />
    <button
      class="primary"
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
    gap: var(--padding);
  }
</style>

<script lang="ts">
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { i18n } from "$lib/stores/i18n";
  import { invalidIcpAddress } from "$lib/utils/accounts.utils";
  import AddressInput from "./AddressInput.svelte";

  export let address = "";
</script>

<article>
  <form on:submit|preventDefault>
    <AddressInput
      bind:address
      rootCanisterId={OWN_CANISTER_ID}
      qrCode={false}
    />
    <button
      class="primary"
      type="submit"
      data-tid="address-submit-button"
      disabled={invalidIcpAddress(address)}
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

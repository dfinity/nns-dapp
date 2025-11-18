<script lang="ts">
  import { goto } from "$app/navigation";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import AddressBook from "$lib/routes/AddressBook.svelte";
  import SignInAddressBook from "$lib/pages/SignInAddressBook.svelte";
  import { ENABLE_ADDRESS_BOOK } from "$lib/stores/feature-flags.store";

  // Redirect to homepage if feature flag is disabled
  $: if (!$ENABLE_ADDRESS_BOOK) {
    goto(AppPath.Portfolio);
  }
</script>

{#if $authSignedInStore}
  <AddressBook />
{:else}
  <SignInAddressBook />
{/if}

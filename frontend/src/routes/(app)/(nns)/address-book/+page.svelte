<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import AddressBook from "$lib/routes/AddressBook.svelte";
  import SignInAddressBook from "$lib/pages/SignInAddressBook.svelte";
</script>

{#if $authSignedInStore}
  <AddressBook />
{:else}
  <SignInAddressBook />
{/if}

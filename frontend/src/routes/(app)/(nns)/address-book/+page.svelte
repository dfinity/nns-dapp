<script lang="ts">
  import { goto } from "$app/navigation";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import AddressBook from "$lib/routes/AddressBook.svelte";

  // Redirect to homepage if not logged in
  $: if (!$authSignedInStore) {
    goto(AppPath.Portfolio);
  }
</script>

{#if $authSignedInStore}
  <AddressBook />
{/if}


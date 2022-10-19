<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import Accounts from "$lib/routes/Accounts.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

{#if signedIn}
  <Accounts />
{:else}
  <h1>Accounts NOT signed in</h1>

  <SignIn />
{/if}

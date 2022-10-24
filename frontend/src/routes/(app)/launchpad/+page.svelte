<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import Launchpad from "$lib/pages/Launchpad.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

{#if signedIn}
  <Launchpad />
{:else}
  <h1>Canisters NOT signed in</h1>

  <SignIn />
{/if}

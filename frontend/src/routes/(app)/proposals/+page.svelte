<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import Proposals from "$lib/pages/Proposals.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

{#if signedIn}
  <Proposals />
{:else}
  <h1>Proposals NOT signed in</h1>

  <SignIn />
{/if}

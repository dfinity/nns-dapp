<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignInSettings from "$lib/pages/SignInSettings.svelte";
  import Settings from "$lib/routes/Settings.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

{#if signedIn}
  <Settings />
{:else}
  <SignInSettings />
{/if}

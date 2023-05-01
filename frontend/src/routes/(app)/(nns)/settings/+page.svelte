<script lang="ts">
  import { authSignedInStore } from "$lib/stores/auth.store";
  import SignInSettings from "$lib/pages/SignInSettings.svelte";
  import Settings from "$lib/routes/Settings.svelte";
</script>

{#if $authSignedInStore}
  <Settings />
{:else}
  <SignInSettings />
{/if}

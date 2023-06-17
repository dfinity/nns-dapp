<script lang="ts">
  import SignInSettings from "$lib/pages/SignInSettings.svelte";
  import Settings from "$lib/routes/Settings.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

{#if $authSignedInStore}
  <Settings />
{:else}
  <SignInSettings />
{/if}

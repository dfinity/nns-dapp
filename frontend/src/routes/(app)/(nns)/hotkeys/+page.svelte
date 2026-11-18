<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import SignInHotkeys from "$lib/pages/SignInHotkeys.svelte";
  import Hotkeys from "$lib/routes/Hotkeys.svelte";
</script>

{#if $authSignedInStore}
  <Hotkeys />
{:else}
  <SignInHotkeys />
{/if}

<script lang="ts">
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import SignInHotkeys from "$lib/pages/SignInHotkeys.svelte";
  import Hotkeys from "$lib/routes/Hotkeys.svelte";
  import { ENABLE_HOTKEYS_PAGE } from "$lib/stores/feature-flags.store";

  $effect(() => {
    if (!$ENABLE_HOTKEYS_PAGE) {
      goto(AppPath.Portfolio);
    }
  });
</script>

{#if $ENABLE_HOTKEYS_PAGE}
  {#if $authSignedInStore}
    <Hotkeys />
  {:else}
    <SignInHotkeys />
  {/if}
{/if}

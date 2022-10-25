<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import Launchpad from "$lib/pages/Launchpad.svelte";
  import { onMount } from "svelte";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  onMount(() => {
    if (!IS_TESTNET) {
      // TODO(GIX-1071): utils?
      goto(AppPath.Accounts, { replaceState: true });
    }

    layoutTitleStore.set($i18n.sns_launchpad.header);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);
  });
</script>

{#if signedIn}
  <Launchpad />
{:else}
  <SignInNNS />
{/if}

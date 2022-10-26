<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import { onMount } from "svelte";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  onMount(async () => {
    if (!IS_TESTNET) {
      // TODO(GIX-1071): utils?
      // SvelteKit issue: https://github.com/sveltejs/kit/issues/1485#issuecomment-1291882125
      const { goto } = await import("$app/navigation");
      await goto(AppPath.Accounts, { replaceState: true });
    }

    layoutTitleStore.set($i18n.sns_launchpad.header);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);
  });
</script>

{#if signedIn}
  <RouteModule path={AppPath.Launchpad} />
{:else}
  <SignInNNS />
{/if}

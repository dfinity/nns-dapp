<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignInSns from "$lib/pages/SignInSns.svelte";
  import { onMount } from "svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { goto } from "$app/navigation";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  onMount(async () => {
    if (!IS_TESTNET) {
      await goto(AppPath.Accounts, { replaceState: true });
      return;
    }

    layoutTitleStore.set($i18n.sns_launchpad.header);
  });
</script>

{#if signedIn}
  <RouteModule path={AppPath.Launchpad} />
{:else}
  <SignInSns />
{/if}

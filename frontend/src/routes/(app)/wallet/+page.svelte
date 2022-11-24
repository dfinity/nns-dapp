<script lang="ts">
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { Island } from "@dfinity/gix-components";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { account: string | null | undefined };

  let accountIdentifier: string | null | undefined;
  $: ({ account: accountIdentifier } = data);
</script>

{#if signedIn}
  <Island>
    <RouteModule path={AppPath.Wallet} params={{ accountIdentifier }} />
  </Island>
{:else}
  <SignInAccounts />
{/if}

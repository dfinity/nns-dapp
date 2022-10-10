<script lang="ts">
  import { ENABLE_SNS_2 } from "$lib/constants/environment.constants";
  import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import { onMount } from "svelte";
  import { routeStore } from "$lib/stores/route.store";
  import { isRoutePath } from "$lib/utils/app-path.utils";
  import { AppPath } from "$lib/constants/routes.constants";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
  import SelectProjectDropdownHeader from "$lib/components/ic/SelectProjectDropdownHeader.svelte";
  import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (
      ENABLE_SNS_2 &&
      isRoutePath({
        paths: [AppPath.LegacyAccounts],
        routePath: $routeStore.path,
      })
    ) {
      routeStore.changeContext(OWN_CANISTER_ID.toText());
    }
  });
</script>

<main class="legacy">
  {#if ENABLE_SNS_2}
    <SelectProjectDropdownHeader />
  {/if}

  {#if $isNnsProjectStore}
    <NnsAccounts />
  {:else if $snsProjectSelectedStore !== undefined}
    <SnsAccounts />
  {/if}
</main>

{#if $isNnsProjectStore}
  <NnsAccountsFooter />
{:else}
  <SnsAccountsFooter />
{/if}

<script lang="ts">
  import { ENABLE_SNS } from "../constants/environment.constants";
  import NnsAccounts from "../pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "../components/accounts/NnsAccountsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "../derived/selected-project.derived";
  import { onMount } from "svelte";
  import { routeStore } from "../stores/route.store";
  import { isRoutePath } from "../utils/app-path.utils";
  import { AppPath } from "../constants/routes.constants";
  import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
  import SnsAccounts from "../pages/SnsAccounts.svelte";
  import SelectProjectDropdownHeader from "../components/ic/SelectProjectDropdownHeader.svelte";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (
      ENABLE_SNS &&
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
  {#if ENABLE_SNS}
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
{/if}

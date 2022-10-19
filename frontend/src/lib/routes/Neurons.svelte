<script lang="ts">
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import { onMount } from "svelte";
  import { routeStore } from "$lib/stores/route.store";
  import { isRoutePath } from "$lib/utils/app-path.utils";
  import { AppPathLegacy } from "$lib/constants/routes.constants";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import SelectProjectDropdownHeader from "$lib/components/ic/SelectProjectDropdownHeader.svelte";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (
      ENABLE_SNS &&
      isRoutePath({
        paths: [AppPathLegacy.LegacyNeurons],
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
    <NnsNeurons />
  {:else if $snsProjectSelectedStore !== undefined}
    <SnsNeurons />
  {/if}
</main>

{#if $isNnsProjectStore}
  <NnsNeuronsFooter />
{/if}

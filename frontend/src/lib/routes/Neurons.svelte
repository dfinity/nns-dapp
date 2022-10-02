<script lang="ts">
  import { ENABLE_SNS } from "../constants/environment.constants";
  import NnsNeurons from "../pages/NnsNeurons.svelte";
  import SnsNeurons from "../pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "../components/neurons/NnsNeuronsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "../derived/selected-project.derived";
  import { onMount } from "svelte";
  import { routeStore } from "../stores/route.store";
  import { isRoutePath } from "../utils/app-path.utils";
  import { AppPath } from "../constants/routes.constants";
  import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
  import SelectProjectDropdownHeader from "../components/ic/SelectProjectDropdownHeader.svelte";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (
      ENABLE_SNS &&
      isRoutePath({
        paths: [AppPath.LegacyNeurons],
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

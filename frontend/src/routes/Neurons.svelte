<script lang="ts">
  import SelectProjectDropdown from "../lib/components/neurons/SelectProjectDropdown.svelte";
  import { ENABLE_SNS } from "../lib/constants/environment.constants";
  import NnsNeurons from "../lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "../lib/pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "../lib/components/neurons/NnsNeuronsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "../lib/derived/selected-project.derived";
  import { onMount } from "svelte";
  import { routeStore } from "../lib/stores/route.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import { AppPath } from "../lib/constants/routes.constants";
  import { OWN_CANISTER_ID } from "../lib/constants/canister-ids.constants";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (
      ENABLE_SNS &&
      isRoutePath({ path: AppPath.LegacyNeurons, routePath: $routeStore.path })
    ) {
      routeStore.changeContext(OWN_CANISTER_ID.toText());
    }
  });
</script>

<main class="legacy">
  {#if ENABLE_SNS}
    <div class="dropdown-wrapper">
      <div class="fit-content">
        <SelectProjectDropdown />
      </div>
    </div>
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

<style lang="scss">
  .dropdown-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    margin-top: var(--padding-4x);

    .fit-content {
      width: fit-content;
    }
  }
</style>

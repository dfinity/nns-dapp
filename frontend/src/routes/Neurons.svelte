<script lang="ts">
  import SelectProjectDropdown from "../lib/components/neurons/SelectProjectDropdown.svelte";
  import { ENABLE_SNS } from "../lib/constants/environment.constants";
  import NnsNeurons from "../lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "../lib/pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "../lib/components/neurons/NnsNeuronsFooter.svelte";
  import {
    isNnsProjectStore,
    selectedProjectStore,
  } from "../lib/derived/projects/selected-project.store";

  $: {
    console.log("in da Neurons route");
    console.log($selectedProjectStore.toText());
    console.log($isNnsProjectStore);
  }
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
  {:else if $selectedProjectStore !== undefined}
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

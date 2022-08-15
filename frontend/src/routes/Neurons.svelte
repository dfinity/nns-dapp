<script lang="ts">
  import SelectProjectDropdown from "../lib/components/neurons/SelectProjectDropdown.svelte";
  import { ENABLE_SNS } from "../lib/constants/environment.constants";
  import NnsNeurons from "../lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "../lib/pages/SnsNeurons.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "../lib/stores/projects.store";
</script>

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

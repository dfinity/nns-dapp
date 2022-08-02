<script lang="ts">
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import SelectProjectDropdown from "../lib/components/neurons/SelectProjectDropdown.svelte";
  import { ENABLE_SNS_NEURONS } from "../lib/constants/environment.constants";
  import NnsNeurons from "../lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "../lib/pages/SnsNeurons.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "../lib/stores/projects.store";
</script>

<MainContentWrapper>
  {#if ENABLE_SNS_NEURONS}
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
</MainContentWrapper>

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

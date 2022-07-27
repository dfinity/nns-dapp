<script lang="ts">
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import SelectProjectDropdown from "../lib/components/neurons/SelectProjectDropdown.svelte";
  import {
    DFX_NETWORK,
    ENABLE_SNS_NEURONS,
  } from "../lib/constants/environment.constants";
  import NnsNeurons from "../lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "../lib/pages/SnsNeurons.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "../lib/stores/projects.store";
</script>

<MainContentWrapper>
  <!-- SNS Canisters can't be deployed to e2e because we can't define subnets on local dfx -->
  <!-- TODO: https://dfinity.atlassian.net/browse/L2-663 -->
  {#if ENABLE_SNS_NEURONS && DFX_NETWORK !== "local"}
    <div class="dropdown-wrapper">
      <div class="fit-content">
        <SelectProjectDropdown />
      </div>
    </div>
  {/if}
  {#if $isNnsProjectStore}
    <NnsNeurons />
  {:else if $snsProjectSelectedStore !== undefined}
    <SnsNeurons rootCanisterId={$snsProjectSelectedStore} />
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

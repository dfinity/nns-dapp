<script lang="ts">
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import SelectProjectDropdown from "../lib/components/neurons/SelectProjectDropdown.svelte";
  import { OWN_CANISTER_ID } from "../lib/constants/canister-ids.constants";
  import {
    DFX_NETWORK,
    ENABLE_SNS_NEURONS,
  } from "../lib/constants/environment.constants";
  import NnsNeurons from "../lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "../lib/pages/SnsNeurons.svelte";
  import { snsProjectSelectedStore } from "../lib/stores/projects.store";

  let selectedCanisterId: string | undefined = undefined;
  $: {
    if (selectedCanisterId !== undefined) {
      snsProjectSelectedStore.set(selectedCanisterId);
    }
  }
</script>

<MainContentWrapper>
  <!-- SNS Canisters can't be deployed to e2e because we can't define subnets on local dfx -->
  <!-- TODO: https://dfinity.atlassian.net/browse/L2-663 -->
  {#if ENABLE_SNS_NEURONS && DFX_NETWORK !== "local"}
    <div class="dropdown-wrapper">
      <div class="fit-content">
        <SelectProjectDropdown bind:selectedCanisterId />
      </div>
    </div>
  {/if}
  <!-- Default value is OWN_CANISTER_ID -->
  {#if $snsProjectSelectedStore === OWN_CANISTER_ID.toText()}
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

    margin: var(--padding-2x) 0;

    .fit-content {
      width: fit-content;
    }
  }
</style>

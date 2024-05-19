<script lang="ts">
  import Proposals from "$lib/pages/NnsProposals.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import SnsProposals from "$lib/pages/SnsProposals.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nonNullish } from "@dfinity/utils";
  import { pageStore } from "$lib/derived/page.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { ENABLE_ACTIONABLE_TAB } from "$lib/stores/feature-flags.store";
  import { onMount } from "svelte";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  import ActionableProposals from "$lib/pages/ActionableProposals.svelte";

  onMount(() => {
    console.log("Proposals component mounted", $pageStore.actionable);
  });
</script>

<main data-tid="proposals-component">
  <!-- TODO: use the store here. Maybe displaySelectActionableLink -->
  {#if $ENABLE_ACTIONABLE_TAB && $authSignedInStore && $pageStore.actionable}
    <ActionableProposals />
  {:else}
    <SummaryUniverse />

    {#if $isNnsUniverseStore}
      <Proposals />
    {:else if nonNullish($snsProjectSelectedStore)}
      <SnsProposals />
    {/if}
  {/if}
</main>

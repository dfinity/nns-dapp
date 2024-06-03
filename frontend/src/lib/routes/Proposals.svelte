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
  import ActionableProposals from "$lib/pages/ActionableProposals.svelte";
  import { fade } from "svelte/transition";
</script>

<main data-tid="proposals-component">
  {#if $ENABLE_ACTIONABLE_TAB && $authSignedInStore && $pageStore.actionable}
    <ActionableProposals />
  {:else}
    <div in:fade|global>
      <SummaryUniverse />
    </div>

    {#if $isNnsUniverseStore}
      <Proposals />
    {:else if nonNullish($snsProjectSelectedStore)}
      <SnsProposals />
    {/if}
  {/if}
</main>

<script lang="ts">
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import ActionableProposals from "$lib/pages/ActionableProposals.svelte";
  import Proposals from "$lib/pages/NnsProposals.svelte";
  import SnsProposals from "$lib/pages/SnsProposals.svelte";
  import { nonNullish } from "@dfinity/utils";
</script>

<main data-tid="proposals-component">
  {#if $authSignedInStore && $pageStore.actionable}
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

<script lang="ts">
  import Proposals from "$lib/pages/NnsProposals.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import SnsProposals from "$lib/pages/SnsProposals.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nonNullish } from "@dfinity/utils";
</script>

<main data-tid="proposals-component">
  <SummaryUniverse />

  {#if $isNnsUniverseStore}
    <Proposals />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsProposals />
  {/if}
</main>

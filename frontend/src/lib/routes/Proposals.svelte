<script lang="ts">
  import Proposals from "$lib/pages/NnsProposals.svelte";
  import {
    isNnsProjectStore,
    snsProjectIdSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import SnsProposals from "$lib/pages/SnsProposals.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
</script>

<main>
  {#if ENABLE_SNS_VOTING}
    <SummaryUniverse />
  {/if}
  {#if $isNnsProjectStore || !ENABLE_SNS_VOTING}
    <Proposals />
  {:else if $snsProjectIdSelectedStore !== undefined && ENABLE_SNS_VOTING}
    <SnsProposals />
  {/if}
</main>

<script lang="ts">
  import Proposals from "$lib/pages/NnsProposals.svelte";
  import {
    isNnsUniverseStore,
    selectedUniverseIdStore,
  } from "$lib/derived/selected-universe.derived";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import SnsProposals from "$lib/pages/SnsProposals.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import type { AppPath } from "$lib/constants/routes.constants";

  export let referrerPath: AppPath | undefined = undefined;
</script>

<main>
  {#if ENABLE_SNS_VOTING}
    <SummaryUniverse />
  {/if}
  {#if $isNnsUniverseStore || !ENABLE_SNS_VOTING}
    <Proposals {referrerPath} />
  {:else if $selectedUniverseIdStore !== undefined && ENABLE_SNS_VOTING}
    <SnsProposals />
  {/if}
</main>

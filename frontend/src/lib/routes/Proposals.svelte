<script lang="ts">
  import Proposals from "$lib/pages/NnsProposals.svelte";
  import {
    isNnsProjectStore,
    snsProjectIdSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import SnsProposals from "$lib/pages/SnsProposals.svelte";
  import Summary from "$lib/components/summary/Summary.svelte";
  import { AppPath } from "$lib/constants/routes.constants";

  export let referrerPath: AppPath | undefined = undefined;
</script>

<main>
  {#if ENABLE_SNS_VOTING}
    <Summary />
  {/if}
  {#if $isNnsProjectStore || !ENABLE_SNS_VOTING}
    <Proposals {referrerPath} />
  {:else if $snsProjectIdSelectedStore !== undefined && ENABLE_SNS_VOTING}
    <SnsProposals />
  {/if}
</main>

<script lang="ts">
  import NnsProposalDetail from "$lib/pages/NnsProposalDetail.svelte";
  import SnsProposalDetail from "$lib/pages/SnsProposalDetail.svelte";
  import {
    isNnsProjectStore,
    snsProjectIdSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import Summary from "$lib/components/summary/Summary.svelte";
  import type { AppPath } from "$lib/constants/routes.constants";

  export let referrerPath: AppPath | undefined = undefined;
  export let proposalIdText: string | null | undefined;

  $: console.log(proposalIdText)
</script>

<main>
  {#if ENABLE_SNS_VOTING}
    <Summary />
  {/if}
  {#if $isNnsProjectStore || !ENABLE_SNS_VOTING}
    <NnsProposalDetail {referrerPath} {proposalIdText} />
  {:else if $snsProjectIdSelectedStore !== undefined && ENABLE_SNS_VOTING}
    <SnsProposalDetail {proposalIdText} />
  {/if}
</main>

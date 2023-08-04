<script lang="ts">
  import NnsProposalDetail from "$lib/pages/NnsProposalDetail.svelte";
  import SnsProposalDetail from "$lib/pages/SnsProposalDetail.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nonNullish } from "@dfinity/utils";

  export let proposalIdText: string | null | undefined;
</script>

<main data-tid="proposal-detail-component">
  {#if $isNnsUniverseStore}
    <NnsProposalDetail {proposalIdText} />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsProposalDetail {proposalIdText} />
  {/if}
</main>

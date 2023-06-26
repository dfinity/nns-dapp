<script lang="ts">
  import NnsProposalDetail from "$lib/pages/NnsProposalDetail.svelte";
  import SnsProposalDetail from "$lib/pages/SnsProposalDetail.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nonNullish } from "@dfinity/utils";
  import { ENABLE_SNS_VOTING } from "$lib/stores/feature-flags.store";

  export let referrerPath: AppPath | undefined = undefined;
  export let proposalIdText: string | null | undefined;
</script>

<main data-tid="proposal-detail-component">
  {#if $isNnsUniverseStore || !$ENABLE_SNS_VOTING}
    <NnsProposalDetail {referrerPath} {proposalIdText} />
  {:else if nonNullish($snsProjectSelectedStore) && $ENABLE_SNS_VOTING}
    <SnsProposalDetail {proposalIdText} />
  {/if}
</main>

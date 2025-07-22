<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ProposalSummary from "$lib/components/proposal-detail/ProposalSummary.svelte";
  import { loadProposal } from "$lib/services/public/proposals.services";
  import { getVoteDisplay } from "$lib/utils/proposals.utils";
  import { KeyValuePairInfo, SkeletonText } from "@dfinity/gix-components";
  import type { BallotInfo, ProposalId, ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";

  export let ballot: Required<BallotInfo>;

  let proposal: ProposalInfo | undefined = undefined;

  onMount(
    async () =>
      await loadProposal({
        proposalId: ballot.proposalId as ProposalId,
        setProposal: (proposalInfo: ProposalInfo) => (proposal = proposalInfo),
        silentErrorMessages: true,
        // TODO (L2-494): optimize history fetching
      })
  );
</script>

<TestIdWrapper testId="ballot-summary-component">
  {#if proposal?.proposal !== undefined}
    <KeyValuePairInfo testId="ballot-summary">
      {#snippet key()}<p class="value" data-tid="proposal-id">{proposal.id}</p
        >{/snippet}
      {#snippet value()}<p class="vote value" data-tid="vote">
          {getVoteDisplay(ballot.vote)}
        </p>{/snippet}
      {#snippet info()}<div class="summary">
          <ProposalSummary summary={proposal.proposal.summary} />
        </div>{/snippet}
    </KeyValuePairInfo>
  {:else}
    <SkeletonText />

    <SkeletonText />

    <div class="summary">
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .vote {
    text-align: right;
  }

  p {
    margin: 0;
  }

  .summary {
    // fix broken layout with too long urls in summary
    word-break: break-word;
    // Fix too wide <pre> with code-blocks
    // (By default, flex items won’t shrink below their minimum content size)
    min-width: 0;
  }
</style>

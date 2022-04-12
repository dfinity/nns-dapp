<script lang="ts">
  import type { BallotInfo, ProposalId, ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { loadProposal } from "../../services/proposals.services";
  import ProposalSummary from "../proposal-detail/ProposalDetailCard/ProposalSummary.svelte";
  import { Vote } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import SkeletonParagraph from "../ui/SkeletonParagraph.svelte";

  export let ballot: Required<BallotInfo>;

  let proposal: ProposalInfo | undefined = undefined;

  onMount(
    async () =>
      await loadProposal({
        proposalId: ballot.proposalId as ProposalId,
        setProposal: (proposalInfo: ProposalInfo) => (proposal = proposalInfo),
      })
  );
</script>

{#if proposal?.proposal !== undefined}
  <p>{proposal.id}</p>

  <p class="vote">{$i18n.core[Vote[ballot.vote].toLowerCase()]}</p>

  <div class="summary"><ProposalSummary proposal={proposal.proposal} /></div>
{:else}
  <SkeletonParagraph />

  <SkeletonParagraph />

  <div class="summary">
    <SkeletonParagraph />
    <SkeletonParagraph />
    <SkeletonParagraph />
  </div>
{/if}

<style lang="scss">
  .vote {
    display: inline-flex;
    align-items: flex-start;
    justify-content: flex-end;
    font-size: var(--font-size-small);
  }

  p {
    margin: var(--padding) 0 0;
  }

  .summary {
    grid-column-start: 1;
    grid-column-end: 3;
    // fix broken layout with too long urls in summary
    word-break: break-word;
    // Fix too wide <pre> with code-blocks
    // (By default, flex items won’t shrink below their minimum content size)
    min-width: 0;
  }
</style>

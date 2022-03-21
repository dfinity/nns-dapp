<script lang="ts">
  import type { BallotInfo, ProposalId, ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { authStore } from "../../stores/auth.store";
  import { loadProposal } from "../../services/proposals.services";
  import ProposalSummary from "../proposal-detail/ProposalDetailCard/ProposalSummary.svelte";
  import { Vote } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import SkeletonText from "../ui/SkeletonText.svelte";

  export let ballot: Required<BallotInfo>;

  let proposal: ProposalInfo | undefined = undefined;

  onMount(
    async () =>
      await loadProposal({
        proposalId: ballot.proposalId as ProposalId,
        identity: $authStore.identity,
        setProposal: (proposalInfo: ProposalInfo) => (proposal = proposalInfo),
      })
  );
</script>

{#if proposal?.proposal !== undefined}
  <p>{proposal.id}</p>

  <p class="vote">{$i18n.core[Vote[ballot.vote].toLowerCase()]}</p>

  <div class="summary"><ProposalSummary proposal={proposal.proposal} /></div>
{:else}
  <p><SkeletonText /></p>

  <p><SkeletonText /></p>

  <div class="summary">
    <SkeletonText />
    <SkeletonText />
    <SkeletonText />
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
  }
</style>

<script lang="ts">
  import ProposalSystemInfoSection from "./ProposalSystemInfoSection.svelte";
  import NnsProposalSummarySection from "./NnsProposalSummarySection.svelte";
  import ProposalVotingSection from "./ProposalVotingSection.svelte";
  import ProposalNavigation from "./ProposalNavigation.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalContext,
  } from "$lib/types/selected-proposal.context";
  import SkeletonDetails from "$lib/components/ui/SkeletonDetails.svelte";
  import NnsProposalProposerActionsEntry from "./NnsProposalProposerActionsEntry.svelte";
  import NnsProposalProposerPayloadEntry from "./NnsProposalProposerPayloadEntry.svelte";
  import {
    filteredProposals,
    uiProposals,
  } from "$lib/derived/proposals.derived";
  import { goto } from "$app/navigation";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import { nonNullish } from "@dfinity/utils";

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );

  const navigateToProposal = async ({
    detail: proposalId,
  }: {
    detail: string;
  }) => {
    await goto(
      buildProposalUrl({
        universe: $pageStore.universe,
        proposalId,
      })
    );
  };
</script>

{#if nonNullish($store.proposal?.id)}
  <ProposalNavigation
    proposalIdString={`${$store.proposal?.id}`}
    proposalIds={$filteredProposals.proposals.map(({ id }) => `${id}`)}
    on:nnsNavigation={navigateToProposal}
  />
{/if}

{#if $store?.proposal !== undefined}
  <div class="content-grid" data-tid="proposal-details-grid">
    <div class="content-a content-cell-island">
      <ProposalSystemInfoSection proposalInfo={$store.proposal} />
    </div>
    <div class="content-b expand-content-b">
      <ProposalVotingSection proposalInfo={$store.proposal} />
    </div>
    <div class="content-c proposal-data-section">
      <NnsProposalSummarySection proposalInfo={$store.proposal} />

      <NnsProposalProposerActionsEntry proposal={$store.proposal.proposal} />

      <NnsProposalProposerPayloadEntry
        proposal={$store.proposal.proposal}
        proposalId={$store.proposalId}
      />
    </div>
  </div>
{:else}
  <div class="content-grid" data-tid="proposal-details-grid">
    <div class="content-a">
      <div class="skeleton">
        <SkeletonDetails />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .proposal-data-section {
    display: flex;
    flex-direction: column;
    gap: var(--row-gap);
  }

  @include media.min-width(medium) {
    // If this would be use elsewhere, we can extract some utility to gix-components
    .content-b.expand-content-b {
      grid-row-end: content-c;
    }
  }
</style>

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
  import { filteredProposals } from "$lib/derived/proposals.derived";
  import { navigateToProposal } from "$lib/utils/proposals.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { referrerPathStore } from "$lib/stores/routes.store";
  import { AppPath } from "$lib/constants/routes.constants";

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );

  let proposalIds: bigint[] | undefined;
  $: proposalIds = $filteredProposals.proposals?.map(({ id }) => id as bigint);
</script>

<TestIdWrapper testId="nns-proposal-component">
  {#if $store?.proposal?.id !== undefined}
    {#if $referrerPathStore !== AppPath.Launchpad}
      <ProposalNavigation
        currentProposalId={$store.proposal.id}
        {proposalIds}
        selectProposal={navigateToProposal}
      />
    {/if}

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
</TestIdWrapper>

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

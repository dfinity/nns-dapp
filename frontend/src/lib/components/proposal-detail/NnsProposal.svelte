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
  import {
    voteRegistrationStore,
    type VoteRegistrationStoreData,
  } from "$lib/stores/vote-registration.store";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import type { ProposalsStore } from "$lib/stores/proposals.store";

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );

  // The proposal that is currently in vote registration process is not included in the filtered proposals list,
  // since it should not be available for voting.
  // But this shouldn't prevent user from navigating to it.
  // Here we are adding this proposal to the list of proposals, so that the navigation block is not hidden for it.
  const collectProposalIds = ({
    proposalStore,
    voteRegistrationStore,
  }: {
    proposalStore: ProposalsStore;
    voteRegistrationStore: VoteRegistrationStoreData;
  }): bigint[] => {
    const proposalIds =
      $filteredProposals.proposals?.map(({ id }) => id as bigint) || [];
    const proposalIdsInRegistrations = (
      voteRegistrationStore.registrations[OWN_CANISTER_ID_TEXT] ?? []
    ).map(({ proposalIdString }) => BigInt(proposalIdString));

    // return unique proposal ids
    return Array.from(new Set([...proposalIds, ...proposalIdsInRegistrations]));
  };

  let proposalIds: bigint[] | undefined;
  $: proposalIds = collectProposalIds({
    proposalStore: $filteredProposals,
    voteRegistrationStore: $voteRegistrationStore,
  });
</script>

{#if $store?.proposal?.id !== undefined}
  <ProposalNavigation
    currentProposalId={$store.proposal.id}
    {proposalIds}
    selectProposal={navigateToProposal}
  />

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

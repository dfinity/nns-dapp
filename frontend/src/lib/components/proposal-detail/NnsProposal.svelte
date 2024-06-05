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
  import {
    getUniversalProposalStatus,
    mapProposalInfo,
    navigateToProposal,
  } from "$lib/utils/proposals.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { referrerPathStore } from "$lib/stores/routes.store";
  import { AppPath } from "$lib/constants/routes.constants";
  import { SplitBlock } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );

  let proposalType: string | undefined;
  $: nonNullish($store.proposal)
    ? ({ type: proposalType } = mapProposalInfo($store.proposal))
    : undefined;

  let proposalIds: bigint[] | undefined;
  $: proposalIds = $actionableProposalsActiveStore
    ? $actionableNnsProposalsStore.proposals?.map(({ id }) => id as bigint)
    : $filteredProposals.proposals?.map(({ id }) => id as bigint);
  let currentProposalId: bigint | undefined;
  $: currentProposalId = $store.proposal?.id;
  let previousProposalId: bigint | undefined;
  // Search for the previous proposal id in the reversed IDs array
  // in case the current proposal is not in the list anymore (after successful vote, for example)
  $: previousProposalId =
    nonNullish(currentProposalId) && nonNullish(proposalIds)
      ? [...proposalIds].reverse().find((id) => id > currentProposalId)
      : undefined;
  let nextProposalId: bigint | undefined;
  $: nextProposalId =
    nonNullish(currentProposalId) && nonNullish(proposalIds)
      ? proposalIds.find((id) => id < currentProposalId)
      : undefined;
</script>

<TestIdWrapper testId="nns-proposal-component">
  {#if $store?.proposal?.id !== undefined && nonNullish(proposalIds)}
    {#if $referrerPathStore !== AppPath.Launchpad && nonNullish(currentProposalId)}
      <ProposalNavigation
        title={proposalType}
        {previousProposalId}
        {nextProposalId}
        currentProposalStatus={getUniversalProposalStatus($store.proposal)}
        selectProposal={navigateToProposal}
      />
    {/if}

    <TestIdWrapper testId="proposal-details-grid">
      <div class="proposal-data-section">
        <div class="content-cell-island">
          <SplitBlock>
            <div slot="start">
              <ProposalSystemInfoSection proposalInfo={$store.proposal} />
            </div>
            <div slot="end">
              <ProposalVotingSection proposalInfo={$store.proposal} />
            </div>
          </SplitBlock>
        </div>
        <NnsProposalSummarySection proposalInfo={$store.proposal} />
        <NnsProposalProposerActionsEntry proposal={$store.proposal.proposal} />
        <NnsProposalProposerPayloadEntry
          proposal={$store.proposal.proposal}
          proposalId={$store.proposalId}
        />
      </div>
    </TestIdWrapper>
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
  .proposal-data-section {
    display: flex;
    flex-direction: column;
    gap: var(--row-gap);
  }
</style>

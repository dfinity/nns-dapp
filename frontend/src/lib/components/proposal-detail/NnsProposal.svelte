<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsProposalProposerActionsEntry from "$lib/components/proposal-detail/NnsProposalProposerActionsEntry.svelte";
  import NnsProposalProposerPayloadEntry from "$lib/components/proposal-detail/NnsProposalProposerPayloadEntry.svelte";
  import NnsProposalSummarySection from "$lib/components/proposal-detail/NnsProposalSummarySection.svelte";
  import ProposalNavigation from "$lib/components/proposal-detail/ProposalNavigation.svelte";
  import ProposalSystemInfoSection from "$lib/components/proposal-detail/ProposalSystemInfoSection.svelte";
  import ProposalVotingSection from "$lib/components/proposal-detail/ProposalVotingSection.svelte";
  import SkeletonDetails from "$lib/components/ui/SkeletonDetails.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  import { actionableProposalsNavigationIdsStore } from "$lib/derived/actionable-universes.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import { filteredProposals } from "$lib/derived/proposals.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import { referrerPathStore } from "$lib/stores/routes.store";
  import type { ProposalsNavigationId } from "$lib/types/proposals";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalContext,
  } from "$lib/types/selected-proposal.context";
  import {
    getUniversalProposalStatus,
    mapProposalInfo,
    navigateToProposal,
  } from "$lib/utils/proposals.utils";
  import { SplitBlock } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { getContext } from "svelte";

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );

  let proposalType: string | undefined;
  $: nonNullish($store.proposal)
    ? ({ type: proposalType } = mapProposalInfo($store.proposal))
    : undefined;

  let proposalIds: ProposalsNavigationId[] | undefined;
  $: proposalIds = $pageStore.actionable
    ? $actionableProposalsNavigationIdsStore
    : ($actionableProposalsActiveStore
        ? $actionableNnsProposalsStore
        : $filteredProposals
      ).proposals?.map(({ id }) => ({
        proposalId: id as bigint,
        universe: $pageStore.universe,
      }));

  const selectProposal = (id: ProposalsNavigationId) => {
    navigateToProposal({ ...id, actionable: $pageStore.actionable });
  };
</script>

<TestIdWrapper testId="nns-proposal-component">
  {#if $store?.proposal?.id !== undefined && nonNullish(proposalIds)}
    {#if $referrerPathStore.at(-1) !== AppPath.Launchpad}
      <ProposalNavigation
        title={proposalType}
        currentProposalId={{
          proposalId: $store.proposal.id,
          universe: OWN_CANISTER_ID_TEXT,
        }}
        universes={$selectableUniversesStore.map(
          ({ canisterId }) => canisterId
        )}
        currentProposalStatus={getUniversalProposalStatus($store.proposal)}
        {proposalIds}
        {selectProposal}
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

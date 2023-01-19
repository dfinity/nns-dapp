<script lang="ts">
  import ProposalSystemInfoSection from "./ProposalSystemInfoSection.svelte";
  import NnsProposalProposerInfoSection from "./NnsProposalProposerInfoSection.svelte";
  import ProposalVotingSection from "./ProposalVotingSection.svelte";
  import NnsProposalProposerDataSection from "./NnsProposalProposerDataSection.svelte";
  import ProposalNavigation from "./ProposalNavigation.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalContext,
  } from "$lib/types/selected-proposal.context";
  import SkeletonDetails from "$lib/components/ui/SkeletonDetails.svelte";

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );
</script>

<ProposalNavigation proposalInfo={$store.proposal} />

{#if $store?.proposal !== undefined}
  <div class="content-grid" data-tid="proposal-details-grid">
    <div class="content-a content-cell-island">
      <ProposalSystemInfoSection proposalInfo={$store.proposal} />
    </div>
    <div class="content-b expand-content-b">
      <ProposalVotingSection proposalInfo={$store.proposal} />
    </div>
    <div class="content-c">
      <NnsProposalProposerInfoSection proposalInfo={$store.proposal} />

      <NnsProposalProposerDataSection proposalInfo={$store.proposal} />
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
  @use "@dfinity/gix-components/styles/mixins/media";

  @include media.min-width(medium) {
    // If this would be use elsewhere, we can extract some utility to gix-components
    .content-b.expand-content-b {
      grid-row-end: content-c;
    }
  }
</style>

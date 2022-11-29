<script lang="ts">
  import ProposalSystemInfoSection from "./ProposalSystemInfoSection.svelte";
  import ProposalProposerInfoSection from "./ProposalProposerInfoSection.svelte";
  import ProposalVotingSection from "./ProposalVotingSection.svelte";
  import ProposalProposerDataSection from "./ProposalProposerDataSection.svelte";
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
    <div class="content-a beach">
      <ProposalSystemInfoSection proposalInfo={$store.proposal} />
    </div>
    <div class="content-b expand-content-b">
      <ProposalVotingSection proposalInfo={$store.proposal} />
    </div>
    <div class="content-c">
      <ProposalProposerInfoSection proposalInfo={$store.proposal} />

      <ProposalProposerDataSection proposalInfo={$store.proposal} />
    </div>
  </div>
{:else}
  <div class="content-grid">
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

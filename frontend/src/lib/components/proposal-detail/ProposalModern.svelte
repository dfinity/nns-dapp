<script lang="ts">
  import Spinner from "../ui/Spinner.svelte";
  import { i18n } from "../../stores/i18n";
  import ProposalSystemInfoSection from "./ProposalSystemInfoSection.svelte";
  import ProposalProposerInfoSection from "./ProposalProposerInfoSection.svelte";
  import ProposalProposerDataSection from "./ProposalProposerDataSection.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalContext,
  } from "../../types/selected-proposal.context";

  export let neuronsReady = false;

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );
</script>

{#if neuronsReady}
  {#if $store?.proposal !== undefined}
    <div class="content-grid" data-tid="proposal-details-grid">
      <div class="content-a">
        <ProposalSystemInfoSection proposalInfo={$store.proposal} />
      </div>
      <div class="content-b">TODO: Vote Info and Cast Vote</div>
      <div class="content-c">
        <ProposalProposerInfoSection proposalInfo={$store.proposal} />
      </div>
      <div class="content-e">
        <ProposalProposerDataSection proposalInfo={$store.proposal} />
      </div>
    </div>
  {:else}
    <div class="content-grid">
      <div class="content-a">TODO skeleton - use SkeletonDetails component</div>
    </div>
  {/if}
{:else}
  <div class="loader">
    <span class="spinner"><Spinner inline size="small" /></span>
    <span> <small>{$i18n.proposal_detail.loading_neurons}</small></span>
  </div>
{/if}

<style lang="scss">
  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .spinner {
    display: inline-block;
    position: relative;
    vertical-align: middle;
  }
</style>

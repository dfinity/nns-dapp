<script lang="ts">
  import Spinner from "../ui/Spinner.svelte";
  import { i18n } from "../../stores/i18n";
  import ProjectSystemInfoSection from "./ProposalSystemInfoSection.svelte";
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
        <ProjectSystemInfoSection proposalInfo={$store.proposal} />
      </div>
      <div class="content-b">TODO: Vote Info</div>
      <div class="content-c">TODO: Proposal User Info</div>
      <div class="content-d">TODO: Cast Vote</div>
    </div>
  {:else}
    <div class="content-grid">
      <div class="content-a">TODO skeleton</div>
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

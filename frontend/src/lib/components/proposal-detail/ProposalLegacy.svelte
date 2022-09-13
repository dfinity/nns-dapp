<script lang="ts">
  import ProposalDetailCard from "./ProposalDetailCard/ProposalDetailCard.svelte";
  import VotesResults from "./VotesResults.svelte";
  import MyVotes from "./MyVotes.svelte";
  import VotingCard from "./VotingCard/VotingCard.svelte";
  import IneligibleNeuronsCard from "./IneligibleNeuronsCard.svelte";
  import { i18n } from "../../stores/i18n";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import { definedNeuronsStore } from "../../stores/neurons.store";
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

<section>
  {#if $store.proposal !== undefined}
    <ProposalDetailCard proposalInfo={$store.proposal} />

    {#if neuronsReady}
      <VotesResults proposalInfo={$store.proposal} />
      <MyVotes proposalInfo={$store.proposal} />
      <VotingCard proposalInfo={$store.proposal} />
      <IneligibleNeuronsCard
        proposalInfo={$store.proposal}
        neurons={$definedNeuronsStore}
      />
    {:else}
      <div class="loader">
        <SkeletonCard cardType="info" />
        <span><small>{$i18n.proposal_detail.loading_neurons}</small></span>
      </div>
    {/if}
  {:else}
    <div class="loader">
      <SkeletonCard cardType="info" />
      <span><small>{$i18n.proposal_detail.loading_neurons}</small></span>
    </div>
  {/if}
</section>

<style lang="scss">
  .loader {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: var(--padding-2x) 0;

    span {
      text-align: center;
    }
  }
</style>

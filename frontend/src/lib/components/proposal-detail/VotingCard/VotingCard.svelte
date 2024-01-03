<script lang="ts">
  import VotingConfirmationToolbar from "./VotingConfirmationToolbar.svelte";
  import { type VoteRegistrationStoreEntry } from "$lib/stores/vote-registration.store";
  import { BottomSheet } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import SpinnerText from "$lib/components/ui/SpinnerText.svelte";
  import MyVotes from "$lib/components/proposal-detail/MyVotes.svelte";
  import IneligibleNeuronsCard from "$lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import VotingNeuronSelectList from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelectList.svelte";
  import {
    type CompactNeuronInfo,
    type IneligibleNeuronData,
    neuronsVotingPower,
  } from "$lib/utils/neuron.utils";
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import VotingNeuronSelect from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelect.svelte";

  export let hasNeurons: boolean;
  export let visible: boolean;
  export let neuronsReady: boolean;
  export let voteRegistration: VoteRegistrationStoreEntry | undefined;
  export let neuronsVotedForProposal: CompactNeuronInfo[];
  export let ineligibleNeurons: IneligibleNeuronData[];
  export let minSnsDissolveDelaySeconds: bigint;

  let votedVotingPower: bigint;
  $: votedVotingPower = neuronsVotingPower(neuronsVotedForProposal);
</script>

<BottomSheet>
  <div
    class="container"
    class:signedIn={$authSignedInStore}
    data-tid="voting-card-component"
  >
    <SignInGuard>
      {#if hasNeurons}
        {#if neuronsReady}
          {#if visible}
            <VotingConfirmationToolbar {voteRegistration} on:nnsConfirm />
          {/if}

          <VotingNeuronSelect
            ineligibleNeuronCount={ineligibleNeurons.length}
            votedNeuronCount={neuronsVotedForProposal.length}
            {votedVotingPower}
          >
            <VotingNeuronSelectList disabled={voteRegistration !== undefined} />
            <MyVotes slot="voted-neurons" {neuronsVotedForProposal} />
            <IneligibleNeuronsCard
              slot="ineligible-neurons"
              {ineligibleNeurons}
              {minSnsDissolveDelaySeconds}
            />
          </VotingNeuronSelect>
        {:else}
          <div class="loader">
            <SpinnerText>{$i18n.proposal_detail.loading_neurons}</SpinnerText>
          </div>
        {/if}
      {/if}
      <span slot="signin-cta">{$i18n.proposal_detail.sign_in}</span>
    </SignInGuard>
  </div>
</BottomSheet>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    display: flex;

    // add scrollbars for too long content
    overflow-y: auto;
    max-height: 100vh;
    @include media.min-width(large) {
      max-height: none;
    }

    // mobile extra padding
    padding: var(--padding) var(--padding-2x);
    @include media.min-width(large) {
      padding: 0 var(--padding) 0 0;
    }

    &.signedIn {
      flex-direction: column;
      gap: var(--padding-3x);
    }

    &:not(.signedIn) {
      justify-content: center;
      padding: var(--padding-2x) 0;

      @include media.min-width(large) {
        display: block;
        padding: 0;
      }
    }
  }

  .loader {
    // Observed values that match bottom sheet height
    padding: var(--padding-3x) var(--padding-2x);

    @include media.min-width(large) {
      padding: var(--padding-3x) 0;
    }
  }
</style>

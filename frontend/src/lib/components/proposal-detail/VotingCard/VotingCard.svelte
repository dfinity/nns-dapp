<script lang="ts">
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import IneligibleNeuronList from "$lib/components/proposal-detail/VotingCard/IneligibleNeuronList.svelte";
  import StakeNeuronToVote from "$lib/components/proposal-detail/VotingCard/StakeNeuronToVote.svelte";
  import VotableNeuronList from "$lib/components/proposal-detail/VotingCard/VotableNeuronList.svelte";
  import VotedNeuronList from "$lib/components/proposal-detail/VotingCard/VotedNeuronList.svelte";
  import SpinnerText from "$lib/components/ui/SpinnerText.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { VoteRegistrationStoreEntry } from "$lib/stores/vote-registration.store";
  import type {
    CompactNeuronInfo,
    IneligibleNeuronData,
  } from "$lib/utils/neuron.utils";
  import VotingConfirmationToolbar from "$lib/components/proposal-detail/VotingCard/VotingConfirmationToolbar.svelte";
  import { BottomSheet } from "@dfinity/gix-components";

  export let hasNeurons: boolean;
  export let visible: boolean;
  export let neuronsReady: boolean;
  export let voteRegistration: VoteRegistrationStoreEntry | undefined;
  export let neuronsVotedForProposal: CompactNeuronInfo[];
  export let ineligibleNeurons: IneligibleNeuronData[];
  export let minSnsDissolveDelaySeconds: bigint;
</script>

<BottomSheet>
  <div
    class="container"
    class:signedIn={$authSignedInStore}
    data-tid="voting-card-component"
  >
    <SignInGuard>
      {#if visible}
        <VotingConfirmationToolbar {voteRegistration} on:nnsConfirm />
      {/if}
      {#if hasNeurons}
        {#if neuronsReady}
          <div class="neuron-groups" data-tid="voting-neuron-select">
            <VotableNeuronList {voteRegistration} />
            <VotedNeuronList {neuronsVotedForProposal} />
            <IneligibleNeuronList
              {ineligibleNeurons}
              {minSnsDissolveDelaySeconds}
            />
          </div>
        {:else}
          <div class="loader" data-tid="loading-neurons-spinner">
            <SpinnerText>{$i18n.proposal_detail.loading_neurons}</SpinnerText>
          </div>
        {/if}
      {:else}
        <StakeNeuronToVote />
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

    /** Fix for iOS Safari 100vh issue
     @src: https://github.com/postcss/postcss-100vh-fix
     */
    // Avoid Chrome to see Safari hack
    @supports (-webkit-touch-callout: none) {
      // The hack for Safari
      max-height: -webkit-fill-available;
    }

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

  .neuron-groups {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  .loader {
    // Observed values that match bottom sheet height
    padding: var(--padding-3x) var(--padding-2x);

    @include media.min-width(large) {
      padding: var(--padding-3x) 0;
    }
  }
</style>

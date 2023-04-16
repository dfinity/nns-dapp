<script lang="ts">
  import { BottomSheet, startBusy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import SpinnerText from "$lib/components/ui/SpinnerText.svelte";
  import type { SnsNeuron, SnsProposalData } from "@dfinity/sns";
  import { fromDefinedNullable, nonNullish } from "@dfinity/utils";
  import { sortedSnsUserNeuronsStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { UniverseCanisterIdText } from "$lib/types/universe";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import {
    voteRegistrationStore,
    type VoteRegistrationStoreEntry,
    votingNeuronSelectStore,
  } from "$lib/stores/vote-registration.store";
  import {
    snsNeuronToVotingNeuron,
    snsProposalIdString,
    snsProposalOpen,
  } from "$lib/utils/sns-proposals.utils";
  import { votableSnsNeurons } from "$lib/utils/sns-neuron.utils";
  import VotingConfirmationToolbar from "$lib/components/proposal-detail/VotingCard/VotingConfirmationToolbar.svelte";
  import type { NervousSystemParameters, SnsVote } from "@dfinity/sns";
  import { registerVoteDemo } from "$lib/services/$public/sns-proposals.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";

  export let proposal: SnsProposalData;

  let proposalIdString: string;
  $: proposalIdString = snsProposalIdString(proposal);

  let universeIdText: UniverseCanisterIdText | undefined;
  $: universeIdText = $snsOnlyProjectStore?.toText();

  let snsParameters: NervousSystemParameters | undefined;
  $: if (nonNullish(universeIdText)) {
    snsParameters = $snsParametersStore[universeIdText]?.parameters;
  }

  let voteRegistration: VoteRegistrationStoreEntry | undefined = undefined;
  $: if (nonNullish(universeIdText)) {
    voteRegistration = (
      $voteRegistrationStore.registrations[universeIdText] ?? []
    ).find(({ proposalIdString: id }) => proposalIdString === id);
  }

  let votableNeurons: SnsNeuron[] = [];
  $: votableNeurons = votableSnsNeurons({
    proposal: proposal,
    neurons: $sortedSnsUserNeuronsStore,
  });

  let visible = false;
  $: $snsOnlyProjectStore,
    $voteRegistrationStore,
    (visible =
      voteRegistration !== undefined ||
      (votableNeurons.length > 0 && snsProposalOpen(proposal)));

  // TODO(sns-voting): implement initial selection (see initialSelectionDone)
  // DEMO selection
  $: if (votableNeurons.length > 0 && nonNullish(snsParameters)) {
    votingNeuronSelectStore.set(
      votableNeurons.map((neuron: SnsNeuron) =>
        snsNeuronToVotingNeuron({
          neuron,
          snsParameters: snsParameters as NervousSystemParameters,
        })
      )
    );
  }

  let neuronsReady = false;
  $: neuronsReady =
    nonNullish(universeIdText) &&
    nonNullish($snsNeuronsStore[universeIdText]?.neurons);

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  const vote = async ({ detail }: { detail: { voteType: SnsVote } }) => {
    startBusy({ initiator: "load-sns-accounts" });
    await registerVoteDemo({ proposal, vote: detail.voteType });
    stopBusy("load-sns-accounts");
  };
</script>

<BottomSheet>
  <div class="container" class:signedIn>
    <SignInGuard>
      {#if $sortedSnsUserNeuronsStore.length > 0}
        {#if neuronsReady}
          {#if visible}
            <VotingConfirmationToolbar
              {voteRegistration}
              on:nnsConfirm={vote}
            />
          {/if}
          TODO: add VotingNeuronSelect {fromDefinedNullable(proposal.id).id}
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

  .container:not(.signedIn) {
    display: flex;
    justify-content: center;
    padding: var(--padding-2x) 0;

    @include media.min-width(large) {
      display: block;
      padding: 0;
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

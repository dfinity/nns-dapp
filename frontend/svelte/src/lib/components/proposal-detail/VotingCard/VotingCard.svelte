<script lang="ts">
  import {
    NeuronInfo,
    ProposalInfo,
    ProposalStatus,
    notVotedNeurons as filterNotVotedNeurons,
    Vote,
  } from "@dfinity/nns";
  import VoteConfirmationModal from "../../../modals/proposals/VoteConfirmationModal.svelte";
  import { listNeurons } from "../../../services/neurons.services";
  import { castVote } from "../../../services/proposals.services";
  import { authStore } from "../../../stores/auth.store";
  import { busyStore } from "../../../stores/busy.store";
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import { toastsStore } from "../../../stores/toasts.store";
  import { selectedNeuronsVotingPover } from "../../../utils/proposals.utils";
  import { stringifyJson, uniqueObjects } from "../../../utils/utils";
  import Card from "../../ui/Card.svelte";
  import CastVoteCardNeuronSelect from "./VotingNeuronSelect.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[];

  let visible: boolean = false;
  let total: bigint;
  let showConfirmationModal: boolean = false;
  let selectedVoteType: Vote = Vote.YES;

  $: votingNeuronSelectStore.set(
    filterNotVotedNeurons({
      neurons,
      proposal: proposalInfo,
    })
  );

  $: total = selectedNeuronsVotingPover({
    neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
  });
  $: visible =
    $votingNeuronSelectStore.neurons.length > 0 &&
    proposalInfo.status === ProposalStatus.PROPOSAL_STATUS_OPEN;

  const showAdoptConfirmation = () => {
    selectedVoteType = Vote.YES;
    showConfirmationModal = true;
  };
  const showRejectConfirmation = () => {
    selectedVoteType = Vote.NO;
    showConfirmationModal = true;
  };
  const cancelConfirmation = () => (showConfirmationModal = false);
  const makeVote = async () => {
    showConfirmationModal = false;
    busyStore.start("vote");

    try {
      const errors = await castVote({
        neuronIds: $votingNeuronSelectStore.selectedIds,
        vote: selectedVoteType,
        proposalId: proposalInfo.id as bigint,
        identity: $authStore.identity,
      });
      await listNeurons();

      // show one error message per UNIQ erroneous response
      const errorDetails = uniqueObjects(errors.filter(Boolean))
        .map((error) => stringifyJson(error?.errorMessage, { indentation: 2 }))
        .join("\n");
      if (errorDetails.length > 0) {
        console.error("vote:", errorDetails);
        toastsStore.show({
          labelKey: "error.register_vote",
          level: "error",
          detail: `\n${errorDetails}`,
        });
      }
    } catch (error) {
      console.error("vote unknown:", error);
      toastsStore.show({
        labelKey: "error.register_vote_unknown",
        level: "error",
        detail: stringifyJson(error, { indentation: 2 }),
      });
    }

    busyStore.stop("vote");
  };
</script>

{#if visible}
  <Card>
    <h3 slot="start">{$i18n.proposal_detail__vote.headline}</h3>

    <p class="headline">
      <span>{$i18n.proposal_detail__vote.neurons}</span>
      <span>{$i18n.proposal_detail__vote.voting_power}</span>
    </p>

    <CastVoteCardNeuronSelect />

    <div role="toolbar">
      <button
        disabled={total === 0n}
        on:click={showAdoptConfirmation}
        class="primary full-width">{$i18n.proposal_detail__vote.adopt}</button
      >
      <button
        disabled={total === 0n}
        on:click={showRejectConfirmation}
        class="danger full-width">{$i18n.proposal_detail__vote.reject}</button
      >
    </div>
  </Card>
  {#if showConfirmationModal}
    <VoteConfirmationModal
      on:nnsClose={cancelConfirmation}
      on:nnsConfirm={makeVote}
      voteType={selectedVoteType}
      votingPower={total}
    />
  {/if}
{/if}

<style lang="scss">
  @use "../../../themes/mixins/media";
  @use "../../../themes/mixins/text";

  .headline {
    padding: calc(0.5 * var(--padding)) var(--padding)
      calc(0.5 * var(--padding)) calc(4.25 * var(--padding));
    display: flex;
    justify-content: space-between;

    font-size: var(--font-size-h4);
    color: var(--gray-200);
    background: var(--gray-100-background);

    // hide voting-power-headline because of the layout
    :last-child {
      display: none;

      @include media.min-width(small) {
        display: initial;
      }
    }
  }

  [role="toolbar"] {
    margin-top: var(--padding);

    display: flex;
    gap: var(--padding);
  }
</style>

<script lang="ts">
  import { Vote } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import VoteConfirmationModal from "../../../modals/proposals/VoteConfirmationModal.svelte";
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import { selectedNeuronsVotingPower } from "../../../utils/proposals.utils";

  const dispatch = createEventDispatcher();

  let total: bigint;
  let showConfirmationModal: boolean = false;
  let selectedVoteType: Vote = Vote.YES;

  $: total = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
  });

  const showAdoptConfirmation = () => {
    selectedVoteType = Vote.YES;
    showConfirmationModal = true;
  };
  const showRejectConfirmation = () => {
    selectedVoteType = Vote.NO;
    showConfirmationModal = true;
  };
  const cancel = () => (showConfirmationModal = false);
  const confirm = () => {
    showConfirmationModal = false;
    dispatch("nnsConfirm", {
      voteType: selectedVoteType,
    });
  };
</script>

<div role="toolbar">
  <button
    data-tid="vote-yes"
    disabled={total === 0n}
    on:click={showAdoptConfirmation}
    class="primary full-width">{$i18n.proposal_detail__vote.adopt}</button
  >
  <button
    data-tid="vote-no"
    disabled={total === 0n}
    on:click={showRejectConfirmation}
    class="danger full-width">{$i18n.proposal_detail__vote.reject}</button
  >
</div>

{#if showConfirmationModal}
  <VoteConfirmationModal
    on:nnsClose={cancel}
    on:nnsConfirm={confirm}
    voteType={selectedVoteType}
    votingPower={total}
  />
{/if}

<style lang="scss">
  [role="toolbar"] {
    margin-top: var(--padding);

    display: flex;
    gap: var(--padding);
  }
</style>

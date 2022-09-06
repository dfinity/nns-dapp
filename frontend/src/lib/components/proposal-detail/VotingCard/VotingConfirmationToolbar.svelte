<script lang="ts">
  import { type ProposalId, type ProposalInfo, Vote } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import VoteConfirmationModal from "../../../modals/proposals/VoteConfirmationModal.svelte";
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import {
    mapProposalInfo,
    selectedNeuronsVotingPower,
  } from "../../../utils/proposals.utils";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import { busy } from "../../../stores/busy.store";
  import type { VoteInProgress } from "../../../stores/voting.store";
  import Spinner from "../../ui/Spinner.svelte";
  import { sanitize } from "../../../utils/html.utils";
  import { VOTING_UI } from "../../../constants/environment.constants";

  const dispatch = createEventDispatcher();

  export let proposalInfo: ProposalInfo;
  export let voteInProgress: VoteInProgress | undefined = undefined;

  let id: ProposalId | undefined;
  let topic: string | undefined;
  let title: string | undefined;
  $: ({ id, topic, title } = mapProposalInfo(proposalInfo));

  let total: bigint;
  let disabled: boolean = true;
  let showConfirmationModal: boolean = false;
  let selectedVoteType: Vote = Vote.Yes;

  $: total = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
    proposal: proposalInfo,
  });
  $: disabled =
    $votingNeuronSelectStore.selectedIds.length === 0 ||
    $busy ||
    voteInProgress !== undefined;

  const showAdoptConfirmation = () => {
    selectedVoteType = Vote.Yes;
    showConfirmationModal = true;
  };
  const showRejectConfirmation = () => {
    selectedVoteType = Vote.No;
    showConfirmationModal = true;
  };
  const cancel = () => (showConfirmationModal = false);
  const confirm = () => {
    showConfirmationModal = false;
    dispatch("nnsConfirm", {
      voteType: selectedVoteType,
    });
  };

  // TODO(L2-965): delete question
</script>

{#if VOTING_UI === "legacy"}
  <p class="question">
    {@html replacePlaceholders($i18n.proposal_detail__vote.accept_or_reject, {
      $id: `${id ?? ""}`,
      $title: sanitize(title ?? ""),
      $topic: sanitize(topic ?? ""),
    })}
  </p>
{/if}

<div role="toolbar" class={`${VOTING_UI}`}>
  <button
    data-tid="vote-yes"
    {disabled}
    on:click={showAdoptConfirmation}
    class="success small"
  >
    {#if voteInProgress?.vote === Vote.Yes}
      <Spinner size="small" />
    {:else}
      {$i18n.proposal_detail__vote.adopt}
    {/if}
  </button>
  <button
    data-tid="vote-no"
    {disabled}
    on:click={showRejectConfirmation}
    class="danger small"
  >
    {#if voteInProgress?.vote === Vote.No}
      <Spinner size="small" />
    {:else}
      {$i18n.proposal_detail__vote.reject}
    {/if}
  </button>
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
  @use "@dfinity/gix-components/styles/mixins/media";

  [role="toolbar"] {
    padding: var(--padding-2x) var(--padding-2x) 0;

    display: flex;
    gap: var(--padding);

    &.modern {
      justify-content: center;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        justify-content: flex-start;
        gap: var(--padding);
      }
    }
  }

  .question {
    margin:  var(--padding-4x) 0  var(--padding-2x);
    word-break: break-word;
  }

  button {
    width: calc(100% - (2 * var(--padding)));

    @include media.min-width(small) {
      width: inherit;
    }
  }
</style>

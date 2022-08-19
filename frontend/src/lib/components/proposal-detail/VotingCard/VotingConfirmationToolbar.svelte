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
  import { sanitizeHTML } from "../../../utils/html.utils";

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
  let selectedVoteType: Vote = Vote.YES;

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

  let sanitizedTitle = "";
  let sanitizedTopic = "";
  $: title, topic,
    (async () => {
      const [cleanTitle, cleanTopic] = await Promise.all([
        sanitizeHTML(title ?? ""),
        sanitizeHTML(topic ?? ""),
      ]);

      sanitizedTopic = cleanTopic;
      sanitizedTitle = cleanTitle;
    })();
</script>

<p class="question">
  {@html replacePlaceholders($i18n.proposal_detail__vote.accept_or_reject, {
    $id: `${id ?? ""}`,
    $title: sanitizedTitle,
    $topic: sanitizedTopic,
  })}
</p>

<div role="toolbar">
  <button
    data-tid="vote-yes"
    {disabled}
    on:click={showAdoptConfirmation}
    class="primary full-width"
  >
    {#if voteInProgress?.vote === Vote.YES}
      <Spinner size="small" />
    {:else}
      {$i18n.proposal_detail__vote.adopt}
    {/if}
  </button>
  <button
    data-tid="vote-no"
    {disabled}
    on:click={showRejectConfirmation}
    class="danger full-width"
  >
    {#if voteInProgress?.vote === Vote.NO}
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
  [role="toolbar"] {
    margin-top: var(--padding);

    display: flex;
    gap: var(--padding);
  }

  .question {
    margin: 0 0 var(--padding-2x);
    word-break: break-word;
  }
</style>

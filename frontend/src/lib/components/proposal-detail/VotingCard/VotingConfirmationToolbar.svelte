<script lang="ts">
  import { type ProposalId, type ProposalInfo, Vote } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import VoteConfirmationModal from "$lib/modals/proposals/VoteConfirmationModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { votingNeuronSelectStore } from "$lib/stores/proposals.store";
  import {
    mapProposalInfo,
    selectedNeuronsVotingPower,
  } from "$lib/utils/proposals.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { busy } from "$lib/stores/busy.store";
  import { Spinner } from "@dfinity/gix-components";
  import { sanitize } from "$lib/utils/html.utils";
  import type { VoteRegistration } from "$lib/stores/vote-registration.store";

  const dispatch = createEventDispatcher();

  export let proposalInfo: ProposalInfo;
  export let voteRegistration: VoteRegistration | undefined = undefined;
  export let layout: "legacy" | "modern";

  let id: ProposalId | undefined;
  let topic: string | undefined;
  let title: string | undefined;
  $: ({ id, topic, title } = mapProposalInfo(proposalInfo));

  let total: bigint;
  let disabled = true;
  let showConfirmationModal = false;
  let selectedVoteType: Vote = Vote.Yes;

  $: total = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
    proposal: proposalInfo,
  });
  $: disabled =
    $votingNeuronSelectStore.selectedIds.length === 0 ||
    $busy ||
    voteRegistration !== undefined;

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

{#if layout === "legacy"}
  <p class="question">
    {@html replacePlaceholders($i18n.proposal_detail__vote.accept_or_reject, {
      $id: `${id ?? ""}`,
      $title: sanitize(title ?? ""),
      $topic: sanitize(topic ?? ""),
    })}
  </p>
{/if}

<div role="toolbar" class={`${layout}`} data-tid="voting-confirmation-toolbar">
  <button
    data-tid="vote-yes"
    {disabled}
    on:click={showAdoptConfirmation}
    class="success"
  >
    {#if voteRegistration?.vote === Vote.Yes}
      <Spinner size="small" />
    {:else}
      {$i18n.proposal_detail__vote.adopt}
    {/if}
  </button>
  <button
    data-tid="vote-no"
    {disabled}
    on:click={showRejectConfirmation}
    class="danger"
  >
    {#if voteRegistration?.vote === Vote.No}
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
    padding: var(--padding) 0 0;

    display: flex;
    gap: var(--padding);

    &.modern {
      padding: var(--padding-2x) var(--padding-2x) 0;
      justify-content: center;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        padding: 0;
        justify-content: flex-start;
        gap: var(--padding);
      }
    }
  }

  .question {
    margin: var(--padding-4x) 0 var(--padding-2x);
    word-break: break-word;
  }

  button {
    min-width: calc(48px + (2 * var(--padding-2x)));
    width: calc(100% - (2 * var(--padding)));

    @include media.min-width(small) {
      width: inherit;
    }
  }
</style>

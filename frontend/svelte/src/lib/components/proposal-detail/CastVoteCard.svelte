<script lang="ts">
  import {
    NeuronInfo,
    ProposalInfo,
    ProposalStatus,
    notVotedNeurons as filterNotVotedNeurons,
    Vote,
  } from "@dfinity/nns";
  import VoteConfirmationModal from "../../modals/proposals/VoteConfirmationModal.svelte";
  import { listNeurons } from "../../services/neurons.services";
  import { castVote } from "../../services/proposals.services";
  import { authStore } from "../../stores/auth.store";
  import { busyStore } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";
  import { formatVotingPower } from "../../utils/proposals.utils";
  import { stringifyJson, uniqObjects } from "../../utils/utils";
  import Card from "../ui/Card.svelte";
  import Checkbox from "../ui/Checkbox.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[] | undefined;

  let visible: boolean = false;
  let notVotedNeurons: NeuronInfo[] | undefined;
  let selectedNeuronIds: Set<bigint> | undefined;
  let selectedVotingPower: bigint | undefined;
  let showConfirmationModal: boolean = false;
  let selectedVoteType: Vote | undefined;

  $: if (neurons) {
    try {
      notVotedNeurons = filterNotVotedNeurons({
        neurons,
        proposal: proposalInfo,
      });
    } catch (err) {
      console.error(err);
    }
  }

  $: visible =
    notVotedNeurons?.length &&
    proposalInfo.status === ProposalStatus.PROPOSAL_STATUS_OPEN;
  // select all neurons by default
  $: if (!selectedNeuronIds && notVotedNeurons?.length)
    selectedNeuronIds = new Set(
      notVotedNeurons.map(({ neuronId }) => neuronId)
    );
  $: selectedVotingPower = notVotedNeurons
    ? notVotedNeurons
        .filter(({ neuronId }) => selectedNeuronIds.has(neuronId))
        .reduce((sum, { votingPower }) => sum + votingPower, 0n)
    : 0n;

  const toggleNeuronSelection = (neuronId: bigint) => {
    if (selectedNeuronIds.has(neuronId)) {
      selectedNeuronIds.delete(neuronId);
    } else {
      selectedNeuronIds.add(neuronId);
    }
    selectedNeuronIds = selectedNeuronIds;
  };
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
        neuronIds: Array.from(selectedNeuronIds),
        vote: selectedVoteType,
        proposalId: proposalInfo.id,
        identity: $authStore.identity,
      });
      await listNeurons();

      // show one error message per UNIQ erroneous response
      const errorDetails = uniqObjects(errors.filter(Boolean))
        .map((error) => stringifyJson(error.errorMessage, { indentation: 2 }))
        .join("\n");
      if (errorDetails) {
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

    <ul>
      {#each notVotedNeurons as { neuronId, votingPower }}
        <li>
          <Checkbox
            inputId={`${neuronId}`}
            checked={selectedNeuronIds.has(neuronId)}
            on:nnsChange={() => toggleNeuronSelection(neuronId)}
            theme="dark"
            text="block"
            selector="neuron-checkbox"
          >
            <span class="neuron-id">{`${neuronId}`}</span>
            <span class="neuron-voting-power"
              >{`${formatVotingPower(votingPower)}`}</span
            >
          </Checkbox>
        </li>
      {/each}
    </ul>

    <p class="total">
      <span>{$i18n.proposal_detail__vote.total}</span>
      {formatVotingPower(selectedVotingPower)}
    </p>

    <div role="toolbar">
      <button
        disabled={!selectedVotingPower}
        on:click={showAdoptConfirmation}
        class="primary full-width">{$i18n.proposal_detail__vote.adopt}</button
      >
      <button
        disabled={!selectedVotingPower}
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
      votingPower={selectedVotingPower}
    />
  {/if}
{/if}

<style lang="scss">
  @use "../../themes/mixins/media";
  @use "../../themes/mixins/text";

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

  ul {
    list-style: none;
    padding: 0;

    // checkbox restyling
    :global(.neuron-checkbox) {
      padding: var(--padding);
    }
    :global(input[type="checkbox"]) {
      margin-left: 0;
    }
    :global(label) {
      margin-left: calc(0.5 * var(--padding));

      display: flex;
      flex-direction: column;
      justify-content: space-between;

      order: 1;

      @include media.min-width(small) {
        flex-direction: row;
        align-items: center;
      }
    }

    .neuron-id {
      font-size: var(--font-size-h5);

      @include media.min-width(medium) {
        font-size: var(--font-size-h4);
      }
    }
    .neuron-voting-power {
      font-size: var(--font-size-ultra-small);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }

  .total {
    margin-top: var(--padding);
    padding: var(--padding);

    display: flex;
    align-items: center;
    justify-content: end;

    border-top: 1px solid currentColor;

    color: var(--gray-200);
    text-align: right;
    font-size: var(--font-size-h5);

    @include media.min-width(medium) {
      font-size: var(--font-size-h4);
    }

    span {
      margin-right: var(--padding);
      font-size: var(--font-size-ultra-small);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }

  [role="toolbar"] {
    margin-top: var(--padding);

    display: flex;
    gap: var(--padding);
  }
</style>

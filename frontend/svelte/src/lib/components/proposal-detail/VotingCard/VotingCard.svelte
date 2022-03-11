<script lang="ts">
  import {
    NeuronInfo,
    ProposalInfo,
    ProposalStatus,
    notVotedNeurons as filterNotVotedNeurons,
    Vote,
  } from "@dfinity/nns";
  import { listNeurons } from "../../../services/neurons.services";
  import { castVote } from "../../../services/proposals.services";
  import { authStore } from "../../../stores/auth.store";
  import { busyStore } from "../../../stores/busy.store";
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import { toastsStore } from "../../../stores/toasts.store";
  import { stringifyJson, uniqueObjects } from "../../../utils/utils";
  import Card from "../../ui/Card.svelte";
  import VotingConfirmationToolbar from "./VotingConfirmationToolbar.svelte";
  import CastVoteCardNeuronSelect from "./VotingNeuronSelect.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[];

  let visible: boolean = false;

  $: votingNeuronSelectStore.set(
    filterNotVotedNeurons({
      neurons,
      proposal: proposalInfo,
    })
  );

  $: visible =
    $votingNeuronSelectStore.neurons.length > 0 &&
    proposalInfo.status === ProposalStatus.PROPOSAL_STATUS_OPEN;

  const vote = async ({ detail }: { detail: { voteType: Vote } }) => {
    busyStore.start("vote");

    try {
      const errors = await castVote({
        neuronIds: $votingNeuronSelectStore.selectedIds,
        vote: detail.voteType,
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
    <VotingConfirmationToolbar on:nnsConfirm={vote} />
  </Card>
{/if}

<style lang="scss">
  @use "../../../themes/mixins/media";

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
</style>

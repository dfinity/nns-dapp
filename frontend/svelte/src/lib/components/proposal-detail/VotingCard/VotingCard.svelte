<script lang="ts">
  import {
    NeuronInfo,
    ProposalInfo,
    ProposalStatus,
    Vote,
    notVotedNeurons,
    ineligibleNeurons,
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
    notVotedNeurons({
      neurons,
      proposal: proposalInfo,
    })
  );

  $: {
    console.log(
      "<Neurons>",
      stringifyJson(neurons, { indentation: 2, devMode: true })
    );
    // console.log(
    //   "proposalInfo",
    //   stringifyJson(proposalInfo, { indentation: 2, devMode: true })
    // );
    console.log(
      "notVotedNeurons",
      notVotedNeurons({
        neurons,
        proposal: proposalInfo,
      }).length
    );
    console.log(
      "ineligibleNeurons",
      ineligibleNeurons({
        neurons,
        proposal: proposalInfo,
      }).length
    );
  }

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
    <CastVoteCardNeuronSelect />
    <VotingConfirmationToolbar on:nnsConfirm={vote} />
  </Card>
{/if}

<style lang="scss">
</style>

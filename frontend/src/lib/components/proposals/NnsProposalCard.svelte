<script lang="ts">
  import type { ProposalInfo, NeuronId, ProposalId } from "@dfinity/nns";
  import {
    mapProposalInfo,
    navigateToNnsProposal,
  } from "$lib/utils/proposals.utils";
  import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
  import ProposalCard from "./ProposalCard.svelte";

  export let proposalInfo: ProposalInfo;
  export let hidden = false;

  let statusString: string;
  let id: ProposalId | undefined;
  let title: string | undefined;
  let color: ProposalStatusColor | undefined;

  let topic: string | undefined;
  let proposer: NeuronId | undefined;
  let type: string | undefined;

  $: ({ id, title, color, topic, proposer, type, statusString } =
    mapProposalInfo(proposalInfo));

  const showProposal = async () =>
    await navigateToNnsProposal(id as ProposalId);
</script>

<ProposalCard
  {hidden}
  on:click={showProposal}
  {statusString}
  {id}
  {title}
  {color}
  {topic}
  proposer={String(proposer)}
  {type}
  deadlineTimestampSeconds={proposalInfo.deadlineTimestampSeconds}
/>

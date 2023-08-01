<script lang="ts">
  import type { ProposalInfo, NeuronId, ProposalId } from "@dfinity/nns";
  import {
    mapProposalInfo,
    navigateToProposal,
  } from "$lib/utils/proposals.utils";
  import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
  import ProposalCard from "./ProposalCard.svelte";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import { get } from "svelte/store";
  import { pageStore } from "$lib/derived/page.derived";

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

  const buildProposalHref = (): string =>
    buildProposalUrl({
      universe: $pageStore.universe,
      proposalId: id as ProposalId,
    });
</script>

<ProposalCard
  {hidden}
  href={buildProposalHref()}
  {statusString}
  {id}
  {title}
  {color}
  {topic}
  proposer={String(proposer)}
  {type}
  deadlineTimestampSeconds={proposalInfo.deadlineTimestampSeconds}
/>

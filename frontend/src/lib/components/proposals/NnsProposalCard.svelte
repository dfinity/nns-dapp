<script lang="ts">
  import type { NeuronId, ProposalInfo, ProposalId } from "@dfinity/nns";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
  import ProposalCard from "./ProposalCard.svelte";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
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

  $: ({ id, title, color, type, statusString, topic, proposer } =
    mapProposalInfo(proposalInfo));

  let href: string;
  $: href = buildProposalUrl({
    universe: $pageStore.universe,
    proposalId: id as ProposalId,
  });
</script>

<ProposalCard
  {hidden}
  {href}
  {statusString}
  {id}
  {title}
  {color}
  {topic}
  proposer={String(proposer)}
  heading={type ?? ""}
  deadlineTimestampSeconds={proposalInfo.deadlineTimestampSeconds}
/>

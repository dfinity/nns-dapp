<script lang="ts">
  import type { NeuronId, ProposalInfo, ProposalId } from "@dfinity/nns";
  import {
    getUniversalProposalStatus,
    mapProposalInfo,
  } from "$lib/utils/proposals.utils";
  import ProposalCard from "./ProposalCard.svelte";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import type { UniversalProposalStatus } from "$lib/types/proposals";

  export let proposalInfo: ProposalInfo;
  export let hidden = false;
  export let actionable = false;
  export let fromActionablePage = false;
  export let index = 0;

  let id: ProposalId | undefined;
  let title: string | undefined;
  let topic: string | undefined;
  let proposer: NeuronId | undefined;
  let type: string | undefined;

  $: ({ id, title, type, topic, proposer } = mapProposalInfo(proposalInfo));

  let href: string;
  $: href = buildProposalUrl({
    universe: $pageStore.universe,
    proposalId: id as ProposalId,
    actionable: fromActionablePage,
  });

  let status: UniversalProposalStatus | undefined;
  $: status = getUniversalProposalStatus(proposalInfo);
</script>

<ProposalCard
  {hidden}
  {index}
  {actionable}
  {href}
  {status}
  {id}
  {title}
  {topic}
  proposer={String(proposer)}
  heading={type ?? ""}
  deadlineTimestampSeconds={proposalInfo.deadlineTimestampSeconds}
/>

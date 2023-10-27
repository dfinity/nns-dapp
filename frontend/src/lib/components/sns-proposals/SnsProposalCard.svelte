<script lang="ts">
  import { mapProposalInfo } from "$lib/utils/sns-proposals.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
  import ProposalCard from "$lib/components/proposals/ProposalCard.svelte";
  import type {
    SnsNervousSystemFunction,
    SnsProposalData,
    SnsProposalId,
  } from "@dfinity/sns";

  export let proposalData: SnsProposalData;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let hidden = false;

  let statusString: string;
  let id: SnsProposalId | undefined;
  let title: string | undefined;
  let color: ProposalStatusColor | undefined;
  let proposal_creation_timestamp_seconds: bigint;
  let type: string | undefined;
  let deadlineTimestampSeconds: bigint | undefined;

  $: ({
    statusString,
    id,
    title,
    color,
    type,
    proposal_creation_timestamp_seconds,
    current_deadline_timestamp_seconds: deadlineTimestampSeconds,
  } = mapProposalInfo({ proposalData, nsFunctions }));

  let href: string;
  $: href = buildProposalUrl({
    universe: $pageStore.universe,
    proposalId: `${id?.id}`,
  });
</script>

<ProposalCard
  {hidden}
  {href}
  {statusString}
  id={id?.id}
  {title}
  {color}
  heading={type ?? ""}
  createdTimestampSeconds={proposal_creation_timestamp_seconds}
  {deadlineTimestampSeconds}
/>

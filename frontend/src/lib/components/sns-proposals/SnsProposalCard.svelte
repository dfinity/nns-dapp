<script lang="ts">
  import { mapProposalInfo } from "$lib/utils/sns-proposals.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
  import ProposalCard from "$lib/components/proposals/ProposalCard.svelte";
  import type {
    SnsNervousSystemFunction,
    SnsNeuronId,
    SnsProposalData,
    SnsProposalId,
  } from "@dfinity/sns";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";

  export let proposalData: SnsProposalData;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let hidden = false;

  let statusString: string;
  let id: SnsProposalId | undefined;
  let title: string | undefined;
  let color: ProposalStatusColor | undefined;
  let type: string | undefined;
  let proposer: SnsNeuronId | undefined;
  let proposerString: string | undefined;
  $: proposerString =
    proposer !== undefined ? subaccountToHexString(proposer.id) : undefined;
  let deadlineTimestampSeconds: bigint | undefined;

  $: ({
    statusString,
    id,
    title,
    color,
    type,
    proposer,
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
  proposer={proposerString}
  {deadlineTimestampSeconds}
/>

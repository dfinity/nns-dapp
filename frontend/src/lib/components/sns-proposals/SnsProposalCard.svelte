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
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import type { SnsProposalDecisionStatus } from "@dfinity/sns";

  export let proposalData: SnsProposalData;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let hidden = false;

  let statusString: string;
  let status: SnsProposalDecisionStatus;
  let id: SnsProposalId | undefined;
  let title: string | undefined;
  let color: ProposalStatusColor | undefined;

  let type: string | undefined;
  let proposer: SnsNeuronId | undefined;
  let proposerString: string | undefined;
  $: proposerString =
    proposer !== undefined
      ? shortenWithMiddleEllipsis(subaccountToHexString(proposer.id))
      : undefined;
  let deadlineTimestampSeconds: bigint | undefined;

  $: ({
    statusString,
    id,
    title,
    color,
    type,
    proposer,
    current_deadline_timestamp_seconds: deadlineTimestampSeconds,
    status,
  } = mapProposalInfo({ proposalData, nsFunctions }));

  const buildProposalHref = (): string =>
    buildProposalUrl({
      universe: $pageStore.universe,
      proposalId: `${id?.id}`,
    });
</script>

<ProposalCard
  {hidden}
  href={buildProposalHref()}
  {statusString}
  id={id?.id}
  {title}
  {color}
  {type}
  proposer={proposerString}
  {deadlineTimestampSeconds}
/>

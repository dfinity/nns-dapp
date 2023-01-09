<script lang="ts">
  import { mapProposalInfo } from "$lib/utils/sns-proposals.utils";
  import { goto } from "$app/navigation";
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

  export let proposalData: SnsProposalData;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let hidden = false;

  let statusString: string;
  let id: SnsProposalId | undefined;
  let title: string | undefined;
  let color: ProposalStatusColor | undefined;

  let topic: string | undefined;
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
    topic,
    proposer,
    current_deadline_timestamp_seconds: deadlineTimestampSeconds,
  } = mapProposalInfo({ proposalData, nsFunctions }));

  const showProposal = async () =>
    await goto(
      buildProposalUrl({
        universe: $pageStore.universe,
        proposalId: `${id}`,
      })
    );
</script>

<ProposalCard
  {hidden}
  on:click={showProposal}
  status={statusString}
  id={id?.id}
  {title}
  {color}
  {topic}
  proposer={proposerString}
  {deadlineTimestampSeconds}
/>

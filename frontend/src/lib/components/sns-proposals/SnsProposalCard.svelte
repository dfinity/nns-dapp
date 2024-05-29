<script lang="ts">
  import {
    getUniversalProposalStatus,
    mapProposalInfo,
  } from "$lib/utils/sns-proposals.utils";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import ProposalCard from "$lib/components/proposals/ProposalCard.svelte";
  import type {
    SnsNervousSystemFunction,
    SnsNeuronId,
    SnsProposalData,
    SnsProposalId,
  } from "@dfinity/sns";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import type { RootCanisterIdText } from "$lib/types/sns";

  export let proposalData: SnsProposalData;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let rootCanisterId: RootCanisterIdText;
  export let actionable = false;
  export let fromActionablePage = false;
  export let hidden = false;

  let id: SnsProposalId | undefined;
  let title: string | undefined;
  let type: string | undefined;
  let proposer: SnsNeuronId | undefined;
  let proposerString: string | undefined;
  $: proposerString =
    proposer !== undefined ? subaccountToHexString(proposer.id) : undefined;
  let deadlineTimestampSeconds: bigint | undefined;

  $: ({
    id,
    title,
    type,
    proposer,
    current_deadline_timestamp_seconds: deadlineTimestampSeconds,
  } = mapProposalInfo({ proposalData, nsFunctions }));

  let status: UniversalProposalStatus | undefined;
  $: status = getUniversalProposalStatus(proposalData);

  let href: string;
  $: href = buildProposalUrl({
    universe: rootCanisterId,
    proposalId: `${id?.id}`,
    actionable: fromActionablePage,
  });
</script>

<ProposalCard
  {status}
  {hidden}
  {actionable}
  {href}
  id={id?.id}
  {title}
  heading={type ?? ""}
  proposer={proposerString}
  {deadlineTimestampSeconds}
/>

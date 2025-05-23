<script lang="ts">
  import ProposalCard from "$lib/components/proposals/ProposalCard.svelte";
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import type { RootCanisterIdText } from "$lib/types/sns";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import {
    getUniversalProposalStatus,
    mapProposalInfo,
  } from "$lib/utils/sns-proposals.utils";
  import type {
    SnsNervousSystemFunction,
    SnsNeuronId,
    SnsProposalData,
    SnsProposalId,
  } from "@dfinity/sns";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import { createSnsTopicsProjectStore } from "$lib/derived/sns-topics.derived";
  import { Principal } from "@dfinity/principal";
  import { get } from "svelte/store";

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
  let topics: TopicInfoWithUnknown[] | undefined;
  $: topics = get(
    createSnsTopicsProjectStore(Principal.fromText(rootCanisterId))
  );

  $: ({
    id,
    title,
    type,
    proposer,
    current_deadline_timestamp_seconds: deadlineTimestampSeconds,
  } = mapProposalInfo({ proposalData, nsFunctions, topics }));

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

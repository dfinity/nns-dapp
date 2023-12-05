<script lang="ts">
  import type { SnsProposalData, SnsTally } from "@dfinity/sns";
  import { SnsProposalRewardStatus } from "@dfinity/sns";
  import SnsVotingCard from "$lib/components/sns-proposals/SnsVotingCard.svelte";
  import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { E8S_PER_ICP } from "$lib/constants/icp.constants";
  import {
    type SnsProposalDataMap,
    snsRewardStatus,
  } from "$lib/utils/sns-proposals.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let proposal: SnsProposalData;
  export let proposalDataMap: SnsProposalDataMap;
  export let reloadProposal: () => Promise<void>;

  let settled = false;
  $: settled =
    snsRewardStatus(proposal) ===
    SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED;

  let tally: SnsTally;
  $: tally = fromDefinedNullable(proposal.latest_tally);
  let yes = 0;
  $: yes = Number(tally.yes) / E8S_PER_ICP;
  let no = 0;
  $: no = Number(tally.no) / E8S_PER_ICP;
  let total = 0;
  $: total = Number(tally.total) / E8S_PER_ICP;
  let deadlineTimestampSeconds: bigint | undefined;
  $: deadlineTimestampSeconds =
    proposalDataMap.current_deadline_timestamp_seconds;
</script>

<TestIdWrapper testId="sns-proposal-voting-section-component">
  <VotesResults {yes} {no} {total} {deadlineTimestampSeconds} />

  {#if !settled}
    <SnsVotingCard {proposal} {reloadProposal} />
  {/if}
</TestIdWrapper>

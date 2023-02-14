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
  import { registerVoteDemo } from "$lib/services/$public/sns-proposals.services";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { SnsProposalDecisionStatus, SnsVote } from "@dfinity/sns";
  import { busy, startBusy } from "@dfinity/gix-components";
  import { stopBusy } from "$lib/stores/busy.store";

  export let proposalData: SnsProposalData;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let hidden = false;

  let statusString: string;
  let status: SnsProposalDecisionStatus;
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
    status,
  } = mapProposalInfo({ proposalData, nsFunctions }));

  const showProposal = async () =>
    await goto(
      buildProposalUrl({
        universe: $pageStore.universe,
        proposalId: `${id?.id}`,
      })
    );

  // DEMO VOTING
  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // TODO(demo): remove after voting implementation
  let demoVoteEnable = false;
  $: demoVoteEnable =
    signedIn &&
    status === SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN;

  // TODO(demo): remove after voting implementation
  const vote = async (vote: SnsVote) => {
    startBusy({ initiator: "load-sns-accounts" });
    await registerVoteDemo({ proposal: proposalData, vote });
    stopBusy("load-sns-accounts");
  };
</script>

<ProposalCard
  {hidden}
  on:click={showProposal}
  {statusString}
  id={id?.id}
  {title}
  {color}
  {topic}
  proposer={proposerString}
  {deadlineTimestampSeconds}
  >{#if demoVoteEnable}
    <div class="demo-vote">
      <button
        class="secondary"
        disabled={$busy}
        on:click|preventDefault|stopPropagation={() => vote(SnsVote.Yes)}
        >Vote Yes</button
      >
      <button
        class="secondary"
        disabled={$busy}
        on:click|preventDefault|stopPropagation={() => vote(SnsVote.No)}
        >Vote No</button
      >
    </div>
  {/if}</ProposalCard
>

<style lang="scss">
  .demo-vote {
    margin-top: var(--padding-2x);
    display: flex;
    justify-content: start;
    gap: var(--padding);
  }
</style>

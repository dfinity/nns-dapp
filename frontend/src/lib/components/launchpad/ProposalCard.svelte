<script lang="ts">
  import Card from "../ui/Card.svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import type { ProposalId } from "@dfinity/nns";
  import Proposer from "../proposals/Proposer.svelte";
  import Value from "../ui/Value.svelte";
  import { i18n } from "../../stores/i18n";
  import { nowInSeconds, secondsToDuration } from "../../utils/date.utils";

  export let proposalInfo: ProposalInfo;

  let id: ProposalId | undefined;
  let title: string | undefined;
  let deadline: bigint | undefined;

  $: ({ id, url, title } = mapProposalInfo(proposalInfo));
  $: deadline =
    proposalInfo.deadlineTimestampSeconds === undefined
      ? undefined
      : (proposalInfo.deadlineTimestampSeconds ?? 0n) - BigInt(nowInSeconds());

  const showProposal = () => {
    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${id}`,
    });
  };
</script>

<Card testId="sns-proposal-card">
  <h3 slot="start">{title}</h3>

  <ul>
    <li>
      <Proposer {proposalInfo} />
    </li>
    <li>
      {$i18n.proposal_detail.id_prefix}
      <Value>{id}</Value>
    </li>
    {#if deadline !== undefined && deadline >= 0}
      <li>
        {$i18n.proposal_detail.open_voting_prefix}
        <Value>{secondsToDuration(deadline)}</Value>
      </li>
    {/if}
  </ul>
  <button data-tid="vote-for-sns" class="primary small" on:click={showProposal}
    >{$i18n.proposal_detail.vote}</button
  >
</Card>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      margin-top: var(--padding-0_5x);

      &:first-child {
        margin-top: 0;
      }
    }

    // proposer
    :global(button) {
      font-size: inherit;
      color: inherit;
    }
  }

  button {
    float: right;
    margin-top: var(--padding);
  }
</style>

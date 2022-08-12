<script lang="ts">
  import type { ProposalId, ProposalInfo } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import Value from "../ui/Value.svelte";
  import { secondsToDuration } from "../../utils/date.utils";
  import Proposer from "./Proposer.svelte";

  export let proposalInfo: ProposalInfo;
  export let showUrl: boolean = false;
  export let showTopic: boolean = false;

  let id: ProposalId | undefined;
  let topic: string | undefined;
  let url: string | undefined;
  let deadline: bigint | undefined;
  $: ({ id, url, deadline, topic } = mapProposalInfo(proposalInfo));
</script>

<ul>
  <li>
    <Proposer {proposalInfo} />
  </li>
  {#if showUrl && url}
    <li>
      <a target="_blank" href={url} rel="noopener noreferrer">{url}</a>
    </li>
  {/if}
  {#if showTopic}
    <li>
      {$i18n.proposal_detail.topic_prefix}
      <Value>{topic}</Value>
    </li>
  {/if}
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

<style lang="scss">
  @use "../../themes/mixins/media";

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

  a {
    font-size: inherit;
    line-height: inherit;
    color: var(--primary);

    overflow-wrap: anywhere;
  }
</style>

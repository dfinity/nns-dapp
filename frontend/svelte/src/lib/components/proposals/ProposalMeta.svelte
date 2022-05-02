<script lang="ts">
  import type {
    NeuronId,
    ProposalId,
    ProposalInfo,
  } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Proposer from "./Proposer.svelte";
  import {mapProposalInfo} from '../../utils/proposals.utils';

  export let proposalInfo: ProposalInfo;
  export let size: "small" | "normal" = "normal";
  export let link: boolean = true;

  let proposer: NeuronId | undefined;
  let id: ProposalId | undefined;
  let topic: string | undefined;
  let url: string | undefined;

  $: ({ proposer, id, url, topic } = mapProposalInfo(proposalInfo));
</script>

{#if link && url}
  <p class:text_small={size === "small"}>
    <a target="_blank" href={url} rel="noopener noreferrer">{url}</a>
  </p>
{/if}

<p class:text_small={size === "small"}><Proposer {proposalInfo} /></p>
<p class:text_small={size === "small"}>
  {$i18n.proposal_detail.topic_prefix}
  {topic}
</p>
<p class:text_small={size === "small"}>
  {$i18n.proposal_detail.id_prefix}
  {id}
</p>

<style lang="scss">
  @use "../../themes/mixins/media";

  a {
    font-size: inherit;
    line-height: inherit;

    overflow-wrap: anywhere;
  }

  p {
    margin: var(--padding-0_5x) 0;

    :global(button) {
      font-size: inherit;
      color: inherit;
    }
  }
</style>

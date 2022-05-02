<script lang="ts">
  import type {
    NeuronId,
    Proposal,
    ProposalId,
    ProposalInfo,
  } from "@dfinity/nns";
  import { Topic } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Proposer from "./Proposer.svelte";

  export let proposalInfo: ProposalInfo;
  export let size: "small" | "normal" = "normal";
  export let link: boolean = true;

  let proposal: Proposal | undefined;
  let proposer: NeuronId | undefined;
  let id: ProposalId | undefined;
  let topic: string | undefined;
  let url: string | undefined;

  $: ({ proposal, proposer, id } = proposalInfo);
  $: topic = $i18n.topics[Topic[proposalInfo?.topic]];
  $: url = proposal?.url;
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

  p:not(.text_small),
  a {
    font-size: var(--font-size-h5);
    line-height: var(--line-height-standard);

    overflow-wrap: anywhere;

    @include media.min-width(medium) {
      font-size: var(--font-size-h4);
    }
  }

  p {
    margin: var(--padding-0_5x) 0;

    :global(button) {
      font-size: inherit;
      color: inherit;
    }
  }
</style>

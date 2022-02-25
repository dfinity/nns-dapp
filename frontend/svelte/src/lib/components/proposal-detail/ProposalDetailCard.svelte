<script lang="ts">
  import { Proposal, ProposalInfo, ProposalStatus, Topic } from "@dfinity/nns";
  import Badge from "../ui/Badge.svelte";
  import Card from "../ui/Card.svelte";
  import CardBlock from "../ui/CardBlock.svelte";
  import {
    ProposalColor,
    PROPOSAL_COLOR,
  } from "../../../lib/constants/proposals.constants";
  import { i18n } from "../../../lib/stores/i18n";
  import {
    proposalFirstActionKey,
    proposalActionFields,
    formatProposalSummary,
  } from "../../../lib/utils/proposals.utils";
  import { removeHTMLTags } from "../../utils/security.utils";

  export let proposalInfo: ProposalInfo;

  let proposal: Proposal | undefined;
  let actionKey: string | undefined;
  let actionFields: [string, string][] | undefined;
  let summary: string | undefined;
  let topic: string | undefined;
  let status: ProposalStatus | undefined;
  let color: ProposalColor | undefined;
  let title: string | undefined;
  let url: string | undefined;

  $: ({ proposal, status } = proposalInfo);
  $: actionKey = proposalFirstActionKey(proposal);
  $: actionFields = proposalActionFields(proposal);
  $: summary = formatProposalSummary(removeHTMLTags(proposal?.summary));
  $: topic = $i18n.topics[Topic[proposalInfo?.topic]];
  $: color = PROPOSAL_COLOR[status];
  $: ({ title, url } = proposal);

  // TODO: show neuron modal https://dfinity.atlassian.net/browse/L2-282
  const showProposerNeuron = () => {
    alert("TBD");
  };
</script>

<Card>
  <h2 slot="start" class="headline" {title}>{title}</h2>
  <Badge slot="end" {color}
    >{status ? $i18n.status[ProposalStatus[status]] : ""}</Badge
  >

  <CardBlock>
    <!-- TODO: implement expandable -- https://dfinity.atlassian.net/browse/L2-270 -->
    <h3 class="block-title" slot="title">{$i18n.proposal_detail.summary}</h3>
    <p class="summary">
      {@html summary}
    </p>
  </CardBlock>

  <div class="meta">
    {#if url}
      <a class="proposal-url" target="_blank" href={url}>{url}</a>
    {/if}

    <a on:click|preventDefault|stopPropagation={showProposerNeuron} href="#_"
      >{$i18n.proposal_detail.proposer_prefix} {proposalInfo.proposer}</a
    >
    <p>
      {$i18n.proposal_detail.topic_prefix}
      {topic}
    </p>
    <p>{$i18n.proposal_detail.id_prefix} {proposalInfo.id}</p>
  </div>

  <CardBlock>
    <h3 class="block-title" slot="title">
      {actionKey}
    </h3>
    <div>
      <ul>
        {#each actionFields as [key, value]}
          <li>
            <h4>{key}</h4>
            <p>{value}</p>
          </li>
        {/each}
      </ul>
    </div>
  </CardBlock>
</Card>

<style lang="scss">
  @use "../../themes/mixins/media";
  @use "../../themes/mixins/text";

  .headline {
    font-size: var(--font-size-h5);
    line-height: var(--line-height-standard);
    @include text.clamp(3);

    @include media.min-width(medium) {
      margin-top: calc(0.5 * var(--padding));
      padding-right: var(--padding);
      font-size: var(--font-size-h3);
    }
  }

  .block-title {
    font-size: var(--font-size-h5);

    @include media.min-width(medium) {
      font-size: var(--font-size-h3);
    }
  }

  .summary {
    font-size: var(--font-size-small);
    color: var(--gray-100);
    white-space: break-spaces;

    @include media.min-width(medium) {
      font-size: var(--font-size-small);
    }

    :global(a) {
      font-size: var(--font-size-small);
      color: var(--blue-400);
      line-height: var(--line-height-standard);
      text-decoration: none;
    }
  }

  .meta {
    margin: calc(3 * var(--padding)) 0;

    a,
    p {
      margin: 0 0 calc(0.5 * var(--padding));
      display: block;

      font-size: var(--font-size-h5);
      line-height: var(--line-height-standard);
      text-decoration: none;
      color: var(--gray-100);

      @include media.min-width(medium) {
        font-size: var(--font-size-h4);
      }
    }
    a {
      margin: 0 calc(-0.5 * var(--padding));
      padding: calc(0.5 * var(--padding));
      width: fit-content;
      border-radius: calc(0.5 * var(--border-radius));

      &:hover {
        background: var(--background-tint);
      }

      &.proposal-url {
        color: var(--blue-400);
      }
    }
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      margin-bottom: var(--padding);

      h4 {
        font-size: var(--font-size-ultra-small);
        color: var(--background-contrast);
        line-height: 1;

        @include media.min-width(medium) {
          font-size: var(--font-size-small);
        }
      }
      p {
        font-size: var(--font-size-ultra-small);
        color: var(--gray-100);
        overflow-wrap: break-word;

        @include media.min-width(medium) {
          font-size: var(--font-size-small);
        }
      }
    }
  }
</style>

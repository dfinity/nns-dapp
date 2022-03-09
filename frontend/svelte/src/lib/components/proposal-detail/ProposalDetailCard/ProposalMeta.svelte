<script lang="ts">
  import { Proposal, ProposalInfo, Topic } from "@dfinity/nns";
  import { i18n } from "../../../../lib/stores/i18n";

  export let proposalInfo: ProposalInfo;

  let proposal: Proposal | undefined;
  let proposer: BigInt | undefined;
  let id: BigInt | undefined;
  let topic: string | undefined;
  let url: string | undefined;

  $: ({ proposal, proposer, id } = proposalInfo);
  $: topic = $i18n.topics[Topic[proposalInfo?.topic]];
  $: url = proposal?.url;

  // TODO: show neuron modal https://dfinity.atlassian.net/browse/L2-282
  const showProposerNeuron = () => {
    alert("TBD");
  };
</script>

<div>
  {#if url}
    <a class="proposal-url" target="_blank" href={url}>{url}</a>
  {/if}

  <button class="text" on:click|stopPropagation={showProposerNeuron}>
    {$i18n.proposal_detail.proposer_prefix}
    {proposer}
  </button>
  <p>
    {$i18n.proposal_detail.topic_prefix}
    {topic}
  </p>
  <p>{$i18n.proposal_detail.id_prefix} {id}</p>
</div>

<style lang="scss">
  @use "../../../themes/mixins/media";

  div {
    margin: calc(3 * var(--padding)) 0;

    a,
    p,
    button {
      display: block;
      margin: 0 0 calc(0.5 * var(--padding));
      padding: 0;

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
</style>

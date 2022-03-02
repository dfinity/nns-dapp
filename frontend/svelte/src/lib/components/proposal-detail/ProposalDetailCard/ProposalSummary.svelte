<script lang="ts">
  import type { Proposal } from "@dfinity/nns";
  import CardBlock from "../../ui/CardBlock.svelte";
  import { i18n } from "../../../../lib/stores/i18n";
  import { formatProposalSummary } from "../../../../lib/utils/proposals.utils";
  import Markdown from "../../ui/Markdown.svelte";
  import { removeHTMLTags } from "../../../utils/security.utils";

  export let proposal: Proposal | undefined;

  let summary: string | undefined;
  $: console.log("summary", summary);
  $: summary = formatProposalSummary(removeHTMLTags(proposal?.summary));
</script>

<CardBlock>
  <!-- TODO: add expandable support -- https://dfinity.atlassian.net/browse/L2-270 -->
  <svelte:fragment slot="title">{$i18n.proposal_detail.summary}</svelte:fragment
  >
  <p>
    <Markdown text={summary} />
  </p>
</CardBlock>

<style lang="scss">
  @use "../../../themes/mixins/media";

  p {
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
</style>

<script lang="ts">
  import type { Proposal } from "@dfinity/nns";
  import Markdown from "../../ui/Markdown.svelte";

  export let proposal: Proposal | undefined;

  let summary: string | undefined;
  $: summary = proposal?.summary;
</script>

<div class="markdown">
  <Markdown text={summary} />
</div>

<style lang="scss">
  @use "../../../themes/mixins/media";

  .markdown {
    font-size: var(--font-size-small);
    color: var(--gray-100);
    overflow-wrap: break-word;

    @include media.min-width(medium) {
      font-size: var(--font-size-small);
    }

    :global(a) {
      font-size: var(--font-size-small);
      color: var(--blue-400);
      line-height: var(--line-height-standard);
      text-decoration: none;
    }

    :global(pre) {
      // make the <code> scrollable
      overflow-x: auto;
    }
  }
</style>

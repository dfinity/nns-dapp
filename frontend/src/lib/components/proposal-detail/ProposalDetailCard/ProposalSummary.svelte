<script lang="ts">
  import type { Proposal } from "@dfinity/nns";
  import Markdown from "../../ui/Markdown.svelte";

  export let proposal: Proposal | undefined;

  let summary: string | undefined;
  $: summary = proposal?.summary;
</script>

<div class="markdown value">
  <Markdown text={summary} />
</div>

<style lang="scss">
  @use "../@dfinity/gix-components/styles/mixins/media";

  .markdown {
    font-size: var(--font-size-small);
    overflow-wrap: break-word;

    @include media.min-width(medium) {
      font-size: var(--font-size-small);
    }

    :global(a) {
      font-size: var(--font-size-small);
      color: var(--primary-tint);
      text-decoration: none;
    }

    :global(pre) {
      // make the <code> scrollable
      overflow-x: auto;
    }
  }
</style>

<script lang="ts">
  import Markdown from "$lib/components/ui/Markdown.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let summary: string | undefined;

  let showTitle: boolean;
  $: showTitle = $$slots.title !== undefined;
</script>

<div class="markdown" data-tid="proposal-summary-component">
  {#if showTitle}
    <div class="title"><slot name="title" /></div>

    {#if nonNullish(summary) && summary !== ""}
      <hr />
    {/if}
  {/if}

  <Markdown text={summary} />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .markdown {
    overflow-wrap: break-word;

    :global(strong) {
      font-weight: var(--font-weight-bold);
    }

    :global(a) {
      @include fonts.standard;
      color: var(--value-color);

      &:hover,
      &:active {
        color: var(--primary);
      }
    }

    :global(h1) {
      @include fonts.h4;
      margin-bottom: var(--padding-2x);
    }

    :global(h2) {
      @include fonts.h5;
      margin-bottom: var(--padding-2x);
    }

    :global(h3),
    :global(h4),
    :global(h5),
    :global(h6) {
      @include fonts.standard(true);
      margin-bottom: var(--padding);
    }

    :global(h1),
    :global(h2),
    :global(h3),
    :global(h4),
    :global(h5),
    :global(h6) {
      color: var(--value-color);
      font-weight: 400;
    }

    :global(table),
    :global(pre) {
      background: var(--input-background);
      color: var(--input-background-contrast);
      border-radius: var(--border-radius);

      font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
        Liberation Mono, monospace;
    }

    :global(table *),
    :global(pre) {
      @include fonts.small;
    }

    :global(table) {
      display: block;
      overflow: auto;
      margin: var(--padding) 0 var(--padding-2x);
      border-spacing: var(--padding-2x) 0;
      padding: var(--padding-2x) 0;
    }

    :global(th) {
      font-weight: 400;
    }

    :global(pre) {
      // make the <code> scrollable
      overflow-x: auto;

      margin: var(--padding-3x) 0 var(--padding-4x);
      padding: var(--padding-2x);
    }

    :global(p),
    :global(ul),
    :global(ol),
    :global(dl) {
      margin: 0 0 var(--padding-3x);
    }

    :global(hr) {
      color: var(--line);
      margin: var(--padding-3x) 0;
    }
  }

  @include media.dark-theme {
    .markdown {
      :global(a) {
        &:hover,
        &:active {
          color: var(--primary-contrast);
        }
      }

      :global(table),
      :global(pre) {
        background: var(--card-background);
        color: var(--card-background-contrast);
      }
    }
  }
</style>

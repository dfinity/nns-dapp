<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import ContentBackdrop from "$lib/gix/components/ContentBackdrop.svelte";
  import Header from "$lib/gix/components/Header.svelte";
  import ScrollSentinel from "$lib/gix/components/ScrollSentinel.svelte";
  import {
    layoutBottomOffset,
    layoutContentScrollY,
    layoutMenuOpen,
  } from "$lib/gix/stores/layout.store";
  import type { OnEventCallback } from "$lib/gix/types/event-modifiers";

  interface Props {
    title?: Snippet;
    toolbarEnd?: Snippet;
    start: Snippet;
    end: Snippet;
    onBack?: OnEventCallback;
  }

  let { title, toolbarEnd, start, end, onBack }: Props = $props();

  export const resetScrollPosition = () => {
    if (scrollableElement) {
      scrollableElement.scrollTop = 0;
    }
  };

  let scrollableElement = $state<HTMLElement | undefined>();

  // Same as in <Content />
  onDestroy(() => ($layoutBottomOffset = 0));
</script>

<div
  style={`--layout-bottom-offset: ${$layoutBottomOffset}px; --content-overflow-y: ${$layoutContentScrollY}`}
  class="content"
  class:open={$layoutMenuOpen}
>
  <div class="start">
    <div class="scrollable-content-start">
      <ContentBackdrop />
      {@render start()}
    </div>
  </div>

  <div class="end">
    <Header {onBack} {title} {toolbarEnd} />

    <div bind:this={scrollableElement} class="scrollable-content-end">
      <ContentBackdrop />

      <ScrollSentinel scrollContainer={scrollableElement} />
      {@render end()}
    </div>
  </div>
</div>

<style lang="scss">
  @use "../styles/mixins/layout";
  @use "../styles/mixins/media";

  .content {
    display: flex;
    flex-flow: column;

    @include layout.content;

    @include media.min-width(large) {
      flex-flow: row nowrap;
      // remove extra space because of menu selection touches the edge
      margin-left: 0;
    }

    // Mobile visual border to match the menu selection
    &.open {
      box-shadow: var(--menu-selection-content-box-shadow);
      // remove extra space because of menu selection touches the edge (when open)
      margin-left: 0;
      border-top-left-radius: var(--border-radius-2x);
    }
  }

  .start,
  .end {
    position: relative;
    box-sizing: border-box;
    @include layout.content-offset;
  }

  .start {
    min-height: var(--content-start-height);
    color: var(--content-start-color);

    @include media.min-width(large) {
      display: block;
      width: var(--content-start-width);
      background: var(--content-start-background);
    }
  }

  .end {
    width: 100%;
    height: calc(100% - var(--content-start-height));

    @include media.min-width(large) {
      height: 100%;
      width: calc(100% - var(--content-start-width));
    }
  }

  .scrollable-content-start,
  .scrollable-content-end {
    @include layout.scrollable-content;
  }

  .scrollable-content-start {
    overflow-y: hidden;

    @include media.min-width(large) {
      overflow-y: auto;
    }
  }
</style>

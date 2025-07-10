<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";
  import { isMobileViewportStore } from "$lib/derived/viewport.derived";

  type Props = {
    testId: string;
    children: Snippet;
    backgroundIcon?: Snippet;
    highlighted?: boolean;
    mobileHref?: string;
  };

  const {
    testId,
    children,
    backgroundIcon,
    highlighted = false,
    mobileHref,
  }: Props = $props();

  const isLinkable = $derived(nonNullish(mobileHref) && $isMobileViewportStore);
</script>

{#snippet content()}
  <article data-tid={testId} class:highlighted>
    {#if nonNullish(backgroundIcon)}
      <div class="background-icon-container" data-tid="background-icon">
        {@render backgroundIcon()}
      </div>
    {/if}
    {@render children()}
  </article>
{/snippet}

{#if isLinkable}
  <a href={mobileHref} data-tid="card-content-link">{@render content()}</a>
{:else}
  {@render content()}
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  a {
    text-decoration: none;
  }

  article {
    position: relative;
    box-sizing: border-box;
    overflow: hidden;

    border-radius: var(--border-radius-2x);
    background-color: var(--card-frame-background, var(--card-background-tint));
    // Designs has no shadow but we keep it for consistency with other cards
    box-shadow: var(--box-shadow);

    // This component provides a height, but not the width.
    height: 180px;
    padding: var(--padding-2x) var(--padding-2x)
      var(--card-frame-padding-bottom, var(--padding-2x));

    @include media.min-width(medium) {
      height: 230px;
      max-height: 230px;
      padding: var(--padding-3x) var(--padding-3x)
        var(--card-frame-padding-bottom, var(--padding-3x));
    }

    &.highlighted {
      background-color: var(--background);
    }
  }

  .background-icon-container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    pointer-events: none;

    opacity: 0.07;
  }
</style>

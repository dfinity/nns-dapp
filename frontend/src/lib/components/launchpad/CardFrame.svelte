<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";

  type Props = {
    testId: string;
    children: Snippet;
    backgroundIcon?: Snippet;
  };

  const { testId, children, backgroundIcon }: Props = $props();
</script>

<article data-tid={testId}>
  {#if nonNullish(backgroundIcon)}
    <div class="background-icon-container">
      {@render backgroundIcon()}
    </div>
  {/if}
  {@render children()}
</article>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  article {
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
    height: 100%;

    border-radius: var(--border-radius-2x);
    background-color: var(--card-background-tint);
    // Designs has no shadow but we keep it for consistency with other cards
    box-shadow: var(--box-shadow);

    // This component provides a height, but not the width.
    min-height: 180px;
    padding: var(--padding-2x);

    @include media.min-width(medium) {
      min-height: 230px;
      padding: var(--padding-3x);
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

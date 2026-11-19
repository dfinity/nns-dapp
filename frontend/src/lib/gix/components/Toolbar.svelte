<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    start?: Snippet;
    children?: Snippet;
    end?: Snippet;
  }

  let { start, children, end }: Props = $props();
</script>

<div class="toolbar" role="toolbar">
  {@render start?.()}

  <div class="main">
    {@render children?.()}
  </div>

  {@render end?.()}
</div>

<style lang="scss">
  @use "../styles/mixins/display";

  .toolbar {
    position: absolute;
    @include display.inset;

    color: var(--toolbar-color, var(--body-color));

    --actions-width: 15%;
    --main-width: calc(100% - (2 * var(--actions-width)));

    display: grid;
    grid-template-columns: var(--actions-width) var(--main-width) var(
        --actions-width
      );

    justify-content: center;
    align-items: center;

    // enable scrolling
    pointer-events: var(--toolbar-pointer-events, none);

    --tooltip-width: fit-content;

    padding: var(--toolbar-padding);

    // buttons
    :global(button),
    :global(.tooltip-wrapper) {
      pointer-events: all;
    }
  }

  .main {
    grid-column: 2 / 3;

    display: flex;
    justify-content: center;
    align-items: stretch;

    justify-self: center;

    max-width: 100%;

    gap: var(--padding);
  }
</style>

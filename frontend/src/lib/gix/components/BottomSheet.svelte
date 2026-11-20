<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { onDestroy, type Snippet, untrack } from "svelte";
  import { slide } from "svelte/transition";
  import { BREAKPOINT_LARGE } from "$lib/gix/constants/constants";
  import { layoutBottomOffset } from "$lib/gix/stores/layout.store";

  interface Props {
    transition?: boolean;
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
  }

  let { transition = false, header, footer, children }: Props = $props();

  onDestroy(() => ($layoutBottomOffset = 0));

  // See also the CSS code of this component. On large screen the bottom sheet is not sticky.
  const updateBottomOffset = () => {
    if (nonNullish(innerWidth) && nonNullish(height)) {
      $layoutBottomOffset = innerWidth < BREAKPOINT_LARGE ? height : 0;
    }
  };

  let height = $state<number | undefined>();
  let innerWidth = $state<number | undefined>();
  $effect(() => {
    [height, innerWidth];

    untrack(() => updateBottomOffset());
  });

  let transitionFn = $derived(transition ? slide : () => ({}));
</script>

<svelte:window bind:innerWidth />

<div
  data-tid="bottom-sheet"
  role="dialog"
  bind:clientHeight={height}
  transition:transitionFn|global={{ axis: "y", duration: 300 }}
>
  {#if nonNullish(header)}
    <span>
      {@render header()}
    </span>
  {/if}

  <span>
    {@render children()}
  </span>

  {#if nonNullish(footer)}
    <span>
      {@render footer()}
    </span>
  {/if}
</div>

<style lang="scss">
  @use "../styles/mixins/media";

  div {
    span {
      display: flex;

      &:nth-child(2) {
        overflow-y: auto;
        flex-direction: inherit;
        padding-top: 0;
      }

      &:last-of-type {
        border-top: 1px solid var(--bottom-sheet-border-color);
      }
    }

    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    flex-direction: column;

    max-height: 90vh;
    max-height: 90dvh;
    overflow-y: auto;

    background: var(--card-background);
    box-shadow: var(--bottom-sheet-box-shadow);

    z-index: var(--bottom-sheet-z-index);

    padding-bottom: env(safe-area-inset-bottom);

    border-top-left-radius: var(--border-radius-2x);
    border-top-right-radius: var(--border-radius-2x);

    @include media.min-width(large) {
      position: relative;

      background: transparent;
      box-shadow: none;

      z-index: auto;

      padding-bottom: 0;

      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
</style>

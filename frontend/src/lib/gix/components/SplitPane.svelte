<script lang="ts">
  import {
    layoutContentTopHidden,
    layoutMenuOpen,
  } from "$lib/gix/stores/layout.store";

  let innerWidth = 0;

  // Close menu if it was opened and the viewport width becomes larger than large screen (where the menu becomes sticky)
  const onWindowSizeChange = (innerWidth: number) => {
    if (!$layoutMenuOpen) {
      return;
    }

    // The media query breakpoint to stick the menu is media large 1024px
    layoutMenuOpen.set(innerWidth > 1024 ? false : $layoutMenuOpen);
  };

  $: onWindowSizeChange(innerWidth);
</script>

<svelte:window bind:innerWidth />

<div class="split-pane" class:header-hidden={$layoutContentTopHidden}>
  <slot name="menu" />
  <slot />
</div>

<style lang="scss">
  @use "../styles/mixins/media";
  @use "../styles/mixins/display";

  .split-pane {
    position: absolute;
    @include display.inset;

    display: flex;
    flex-flow: row nowrap;
  }

  // BEGIN: On small devices the header is sticky

  .split-pane {
    --split-pane-content-top-offset: calc(
      var(--header-offset, 0px) + var(--header-height)
    );
    padding-top: var(--split-pane-content-top-offset);
    transition: padding-top var(--animation-time-normal) ease;

    &.header-hidden {
      padding-top: 0;
      // Reset on tablet+
      @include media.min-width(medium) {
        padding-top: var(--split-pane-content-top-offset);
      }
      @include media.min-width(large) {
        padding-top: var(--header-offset, 0);
      }
    }

    :global(header) {
      position: fixed;
      z-index: var(--menu-z-index);
    }

    @include media.min-width(large) {
      padding-top: var(--header-offset, 0px);

      :global(header) {
        position: absolute;
      }
    }
  }

  // END: sticky header
</style>

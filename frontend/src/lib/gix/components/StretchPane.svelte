<script lang="ts">
  import { BREAKPOINT_LARGE } from "$lib/gix/constants/constants";
  import { layoutMenuOpen } from "$lib/gix/stores/layout.store";

  let innerWidth = 0;

  // Close menu if it was opened and the viewport width becomes larger than large screen (where the menu becomes sticky)
  const onWindowSizeChange = (innerWidth: number) => {
    if (!$layoutMenuOpen) {
      return;
    }

    // The media query breakpoint to stick the menu is media large 1024px
    layoutMenuOpen.set(innerWidth > BREAKPOINT_LARGE ? false : $layoutMenuOpen);
  };

  $: onWindowSizeChange(innerWidth);
</script>

<svelte:window bind:innerWidth />

<div class="stretch-pane">
  <slot name="menu" />
  <slot />
</div>

<style lang="scss">
  @use "../styles/mixins/media";
  @use "../styles/mixins/display";

  .stretch-pane {
    position: absolute;
    @include display.inset;

    padding-top: var(--header-offset, 0px);

    display: flex;
    flex-flow: row nowrap;
  }
</style>

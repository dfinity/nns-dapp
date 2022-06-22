<script lang="ts">
  export let sticky = false;
  let innerWidth: number = 0;

  // The media query breakpoint to stick the menu is xlarge 1300px
  $: sticky = innerWidth > 1300;
</script>

<svelte:window bind:innerWidth />

<slot name="header" />

<div class="split-pane">
  <slot name="menu" />
  <div class="content"><slot /></div>
</div>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  .split-pane {
    position: absolute;
    top: calc(var(--header-offset, 0px) + var(--header-height));
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    flex-flow: row nowrap;
  }

  .content {
    position: relative;
    width: 100%;
  }

  @include media.min-width(xlarge) {
    :global(header [role="toolbar"]) {
      padding-left: var(--menu-width);
    }
  }
</style>

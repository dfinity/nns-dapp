<script lang="ts">
  import IconBack from "$lib/gix/icons/IconBack.svelte";
  import { i18n } from "$lib/gix/stores/i18n";
  import { layoutMenuOpen } from "$lib/gix/stores/layout.store";
  import { menuCollapsed, menuStore } from "$lib/gix/stores/menu.store";
  import { handleKeyPress } from "$lib/gix/utils/keyboard.utils";

  export let sticky = true;

  const close = () => layoutMenuOpen.set(false);
</script>

<div class:open={$layoutMenuOpen} role="menu">
  <div
    class="inner"
    class:open={$layoutMenuOpen}
    class:sticky
    data-tid="menu-inner"
    role="button"
    tabindex="-1"
    on:click={close}
    on:keypress={($event) => handleKeyPress({ $event, callback: close })}
  >
    <div class="top-logo">
      {#if !$menuCollapsed || $layoutMenuOpen}
        <slot name="logo" />
      {/if}
    </div>

    <div class="slot-content">
      <slot />
    </div>

    <div class="bottom-logo">
      {#if !$menuCollapsed || $layoutMenuOpen}
        <slot name="oneliner" />
      {/if}
    </div>
  </div>

  <button
    class="menu-collapse icon-only"
    data-tid="menu-collapse"
    title={$menuCollapsed ? $i18n.core.expand : $i18n.core.collapse}
    type="button"
    on:click={menuStore.toggle}><IconBack /></button
  >
</div>

<style lang="scss">
  @use "../styles/mixins/interaction";
  @use "../styles/mixins/display";
  @use "../styles/mixins/media";

  div[role="menu"] {
    @include interaction.initial;

    box-sizing: border-box;

    z-index: var(--menu-z-index);

    --menu-logo-height: 65px;
    --menu-stack: 1em;
    --menu-large-left-padding: var(--padding-2x);
    --menu-small-left-padding: var(--padding);

    position: relative;

    --top-logo-height: calc(
      var(--menu-logo-height) + var(--padding-4x) +
        var(--header-offset, 0px) - var(--menu-selection-outer-radius)
    );

    // Shift the menu on large screen e.g. if a banner is displayed
    @include media.min-width(large) {
      --top-logo-height: calc(
        var(--menu-logo-height) + var(--padding-3x) + var(--header-offset, 0px)
      );
    }
  }

  .inner {
    display: flex;
    flex-direction: column;

    width: 0;
    max-width: 100vw;
    height: 100%;

    overflow-y: auto;
    margin-left: -100%;

    transition:
      margin-left var(--animation-time-normal)
        var(--menu-animation-timing-function),
      width var(--animation-time-normal) var(--menu-animation-timing-function);

    // On large screen the header is not sticky but within the content that's why we align the inner menu start
    box-sizing: border-box;

    .top-logo {
      color: var(--menu-color);
      box-sizing: border-box;
      height: var(--top-logo-height);
      padding-top: var(--menu-stack);

      @include media.min-width(large) {
        padding-top: calc(var(--menu-stack) + var(--padding));
      }
    }

    .slot-content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      gap: var(--padding-0_5x);

      // More space for menu selection touches the edge;
      // otherwise the first selected menu entry would be cut off in mobile view.
      padding-top: var(--menu-selection-outer-radius);

      padding-left: var(--menu-small-left-padding);

      @include media.min-width(large) {
        padding-top: var(--padding-4x);
      }

      @include media.min-width(large) {
        padding-left: var(--menu-large-left-padding);
      }
    }

    .bottom-logo {
      display: flex;
      color: var(--menu-color);
      align-self: center;
      padding-top: var(--padding-3x);
      padding-bottom: var(--padding-3x);
    }

    &.sticky {
      // On large screen the menu can be always open
      @include media.min-width(large) {
        width: calc(var(--menu-width) + var(--menu-large-left-padding));
        margin-left: 0;
      }
    }

    // On smaller screen the menu is open on demand
    &.open {
      width: calc(var(--menu-width) + var(--menu-small-left-padding));
      margin-left: 0;
    }
  }
</style>

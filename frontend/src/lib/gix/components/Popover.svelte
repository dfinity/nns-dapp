<!-- https://github.com/papyrs/papyrs/blob/main/src/lib/components/ui/Popover.svelte -->
<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { fade, scale } from "svelte/transition";
  import Backdrop from "$lib/gix/components/Backdrop.svelte";
  import IconClose from "$lib/gix/icons/IconClose.svelte";
  import { i18n } from "$lib/gix/stores/i18n";
  import type { PopoverDirection } from "$lib/gix/types/popover";
  import { computePopoverPlacement } from "$lib/gix/utils/popover.utils";

  export let anchor: HTMLElement | undefined = undefined;
  export let visible = false;
  export let direction: PopoverDirection = "ltr";
  export let closeButton = false;
  export let invisibleBackdrop = false;
  export let testId = "gix-cmp-popover-component";

  // Fallback used when `--padding` cannot be read (e.g. before the CSS
  // variables are applied). Matches the default declared in
  // `src/lib/styles/global/variables.scss`.
  const DEFAULT_VIEWPORT_PADDING = 8;

  let popoverTop = 0;
  let popoverLeft = 0;
  let popoverRight = 0;
  let panelWidth = 0;
  let placementResolved = false;
  let effectiveDirection: PopoverDirection = direction;

  const readViewportPadding = (): number => {
    if (typeof window === "undefined") {
      return DEFAULT_VIEWPORT_PADDING;
    }

    const raw = getComputedStyle(document.documentElement).getPropertyValue(
      "--padding"
    );

    const parsed = parseFloat(raw);

    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_VIEWPORT_PADDING;
  };

  const initPosition = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!anchor) {
      popoverTop = 0;
      popoverLeft = 0;
      popoverRight = 0;
      effectiveDirection = direction;

      return;
    }

    const { bottom, left, right } = anchor.getBoundingClientRect();

    const viewportWidth = document.documentElement.clientWidth;

    const placement = computePopoverPlacement({
      anchorLeft: left,
      anchorRight: right,
      panelWidth,
      viewportWidth,
      viewportPadding: readViewportPadding(),
      preferredDirection: direction,
    });

    popoverTop = bottom;
    popoverLeft = placement.left;
    popoverRight = placement.right;
    effectiveDirection = placement.direction;
  };

  $: (anchor, visible, direction, initPosition());

  const observePanelWidth = (node: HTMLElement) => {
    placementResolved = false;

    const measure = () => {
      const next = node.offsetWidth;

      if (next === panelWidth) {
        return;
      }

      panelWidth = next;

      initPosition();

      if (next > 0) {
        placementResolved = true;
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return {};
    }

    const ro = new ResizeObserver(measure);

    ro.observe(node);

    return {
      destroy: () => {
        ro.disconnect();

        placementResolved = false;
        panelWidth = 0;
      },
    };
  };

  const close = () => (visible = false);
</script>

<svelte:window on:resize={initPosition} />

{#if visible}
  <div
    style="--popover-top: {popoverTop}px; --popover-left: {popoverLeft}px; --popover-right: {popoverRight}px"
    class="popover"
    aria-orientation="vertical"
    data-tid={testId}
    role="menu"
    tabindex="-1"
    on:click
    on:keypress
    transition:fade|global
  >
    <Backdrop
      invisible={invisibleBackdrop}
      on:nnsClose={() => (visible = false)}
    />
    <div
      class="wrapper"
      class:placed={placementResolved}
      class:rtl={effectiveDirection === "rtl"}
      class:with-border={invisibleBackdrop}
      use:observePanelWidth
      transition:scale|global={{ delay: 25, duration: 150, easing: quintOut }}
    >
      {#if closeButton}
        <button
          class="close icon-only"
          aria-label={$i18n.core.close}
          type="button"
          on:click|stopPropagation={close}><IconClose /></button
        >
      {/if}

      <div class="popover-content" data-tid="popover-content">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../styles/mixins/display";

  .popover {
    position: fixed;
    @include display.inset;

    z-index: var(--overlay-z-index);
  }

  .wrapper {
    cursor: initial;

    // position
    position: absolute;
    top: calc(var(--popover-top) + var(--padding));
    left: var(--popover-left);

    // size
    --size: min(calc(20 * var(--padding)), calc(100vw - var(--padding)));

    min-width: var(--size);
    // Loose cap used during the first paint so we can measure the panel's
    // natural width. `.placed` swaps this for a side-aware cap that keeps the
    // panel inside the viewport on whichever side was chosen.
    max-width: calc(100vw - var(--padding));

    max-height: calc(
      var(--full-vh, 100vh) - var(--popover-top) - calc(6 * var(--padding))
    );

    width: fit-content;
    height: auto;

    padding: var(--padding-2x);
    display: flex;
    flex-direction: column;

    background-color: var(--dropdown-background);
    color: var(--background-contrast);

    border-radius: var(--border-radius);

    @supports (height: 100dvh) {
      --full-vh: 100dvh;
    }

    &.rtl {
      left: auto;
      right: var(--popover-right);
    }

    // After the initial measurement, clamp the panel to the available room on
    // the chosen side so it never extends past the viewport edge.
    &.placed {
      max-width: calc(100vw - var(--popover-left) - var(--padding));
    }

    &.placed.rtl {
      max-width: calc(100vw - var(--popover-right) - var(--padding));
    }

    &.with-border {
      border: var(--dropdown-border-size) solid var(--dropdown-border-color);
    }
  }

  .close {
    align-self: flex-end;
  }

  .popover-content {
    overflow-y: auto;
  }
</style>

<script lang="ts">
  import { onDestroy } from "svelte";
  import { debounce } from "@dfinity/utils";

  export let id: string;
  export let testId = "tooltip-component";
  export let text = "";
  export let noWrap = false;
  export let top = false;
  export let containerSelector = "main";

  let tooltipComponent: HTMLDivElement | undefined = undefined;
  let target: HTMLDivElement | undefined = undefined;
  let innerWidth: number | undefined = undefined;
  let tooltipStyle: string | undefined = undefined;

  const setPosition = debounce(() => {
    // We need the main reference because at the moment the scrollbar is displayed in that element therefore it's the way to get to know the real width - i.e. window width - scrollbar width
    const main: HTMLElement | null = document.querySelector(containerSelector);

    if (
      destroyed ||
      main === null ||
      tooltipComponent === undefined ||
      target === undefined
    ) {
      // Do nothing, we need the elements to be rendered in order to get their size and position to fix the tooltip
      return;
    }

    const { innerWidth } = window;

    const SCROLLBAR_FALLBACK_WIDTH = 20;

    const { clientWidth, offsetWidth } = main;
    const scrollbarWidth =
      offsetWidth - clientWidth > 0
        ? offsetWidth - clientWidth
        : SCROLLBAR_FALLBACK_WIDTH;

    const { left: targetLeft, width: targetWidth } =
      target.getBoundingClientRect();
    const targetCenter = targetLeft + targetWidth / 2;

    const { width: tooltipWidth } = tooltipComponent.getBoundingClientRect();

    const spaceLeft = targetCenter - (innerWidth - clientWidth) / 2;
    const spaceRight = innerWidth - scrollbarWidth - targetCenter;

    const overflowLeft = spaceLeft > 0 ? tooltipWidth / 2 - spaceLeft : 0;
    const overflowRight = spaceRight > 0 ? tooltipWidth / 2 - spaceRight : 0;

    const { left: mainLeft, right: mainRight } = main.getBoundingClientRect();

    // If we cannot calculate the overflow left we then avoid overflow by setting no transform on the left side
    const leftToMainCenter =
      mainLeft + (mainRight - mainLeft) / 2 > targetCenter;

    // If tooltip overflow both on left and right, we only set the left anchor.
    // It would need the width to be maximized to window screen too but it seems to be an acceptable edge case.
    tooltipStyle =
      overflowLeft > 0
        ? `--tooltip-transform-x: calc(-50% + ${overflowLeft}px)`
        : overflowRight > 0
        ? `--tooltip-transform-x: calc(-50% - ${overflowRight}px)`
        : leftToMainCenter
        ? `--tooltip-transform-x: 0`
        : undefined;
  });

  $: innerWidth, tooltipComponent, target, setPosition();

  let destroyed = false;
  onDestroy(() => (destroyed = true));
</script>

<svelte:window bind:innerWidth />

<div class="tooltip-wrapper" data-tid={testId}>
  <div class="tooltip-target" aria-describedby={id} bind:this={target}>
    <slot />
  </div>
  <div
    class="tooltip"
    role="tooltip"
    {id}
    class:noWrap
    class:top
    bind:this={tooltipComponent}
    style={tooltipStyle}
  >
    {text}
  </div>
</div>

<style lang="scss">
  .tooltip-wrapper {
    position: relative;
    display: var(--tooltip-display, block);
    width: var(--tooltip-width);
  }

  .tooltip {
    z-index: calc(var(--overlay-z-index) + 1);

    position: absolute;
    display: inline-block;

    left: 50%;
    bottom: var(--padding-0_5x);
    --tooltip-transform-x-default: calc(-50% - var(--padding-4x));
    transform: translate(
      var(--tooltip-transform-x, var(--tooltip-transform-x-default)),
      100%
    );

    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms, visibility 150ms;

    padding: 4px 6px;
    border-radius: 4px;

    font-size: var(--font-size-small);

    background: var(--card-background-contrast);
    color: var(--card-background);

    // limit width
    white-space: pre-wrap;
    max-width: 240px;
    width: max-content;
    overflow-wrap: break-word;

    &.noWrap {
      white-space: nowrap;
    }

    &.top {
      bottom: unset;
      top: calc(-1 * var(--padding));
      transform: translate(
        var(--tooltip-transform-x, var(--tooltip-transform-x-default)),
        -100%
      );
    }

    pointer-events: none;
  }

  .tooltip-target {
    height: 100%;

    &:hover + .tooltip {
      opacity: 1;
      visibility: initial;
    }
  }
</style>

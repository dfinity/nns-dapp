<script lang="ts">
  /** Used in aria-describedby */
  import { debounce } from "../../utils/utils";

  export let id: string;
  export let text = "";
  export let noWrap: boolean = false;

  let tooltipComponent: HTMLDivElement | undefined = undefined;
  let target: HTMLDivElement | undefined = undefined;
  let innerWidth: number | undefined = undefined;
  let tooltipStyle: string | undefined = undefined;

  const setPosition = debounce(() => {
    // We get the main reference because at the moment the scrollbar is displayed in that element therefore it's the way to get to know the real width
    const clientWidth = document.querySelector("main")?.clientWidth;

    if (
      clientWidth === undefined ||
      tooltipComponent === undefined ||
      target === undefined
    ) {
      // Do nothing, we need the elements to be rendered in order to get their size and position to fix the tooltip
      return;
    }

    const { left: targetLeft, width: targetWidth } =
      target.getBoundingClientRect();
    const targetCenter = targetLeft + targetWidth / 2;

    const { width: tooltipWidth } = tooltipComponent.getBoundingClientRect();

    const spaceLeft = targetCenter;
    const spaceRight = clientWidth - targetCenter;

    const overflowLeft = tooltipWidth / 2 - spaceLeft;
    const overflowRight = tooltipWidth / 2 - spaceRight;

    // If tooltip overflow both on left and right, we only set the left anchor.
    // It would need the width to be maximized to window screen too but it seems to be an acceptable edge case.
    tooltipStyle =
      overflowLeft > 0
        ? `--tooltip-transform-x: calc(-50% + ${overflowLeft}px)`
        : overflowRight > 0
        ? `--tooltip-transform-x: calc(-50% - ${overflowRight}px)`
        : undefined;
  });

  $: innerWidth, tooltipComponent, target, setPosition();
</script>

<svelte:window bind:innerWidth />
<div class="tooltip-wrapper">
  <div class="tooltip-target" aria-describedby={id} bind:this={target}>
    <slot />
  </div>
  <div
    class="tooltip"
    role="tooltip"
    {id}
    class:noWrap
    bind:this={tooltipComponent}
    style={tooltipStyle}
  >
    {text}
  </div>
</div>

<style lang="scss">
  .tooltip-wrapper {
    position: relative;
    display: var(--tooltip-display);
    width: var(--tooltip-width);
  }

  .tooltip {
    z-index: var(--z-index);

    position: absolute;
    display: inline-block;

    left: 50%;
    bottom: var(--padding-0_5x);
    transform: translate(var(--tooltip-transform-x, -50%), 100%);

    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms, visibility 150ms;

    padding: 4px 6px;
    border-radius: 4px;

    font-size: var(--font-size-ultra-small);
    background: var(--gray-600);

    color: var(--gray-600-contrast);

    // limit width
    white-space: pre-wrap;
    max-width: 240px;
    width: max-content;

    &.noWrap {
      white-space: nowrap;
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

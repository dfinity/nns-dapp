<script context="module" lang="ts">
  let nextTooltipIdSuffix = 0;
</script>

<script lang="ts">
  import { isNullish, nonNullish, notEmptyString } from "@dfinity/utils";
  import { afterUpdate, onMount, onDestroy } from "svelte";
  import { translateTooltip } from "$lib/gix/utils/tooltip.utils";

  export let id: string | undefined = undefined;
  export let idPrefix = "tooltip";
  export let testId = "gix-cmp-tooltip-component";
  export let text: string | undefined = undefined;
  export let noWrap = false;
  export let top = false;
  export let center = false;

  let tooltipComponent: HTMLDivElement | undefined = undefined;
  let target: HTMLDivElement | undefined = undefined;
  let targetIsHovered = false;
  let tooltipTransformX = 0;
  let tooltipTransformY = 0;
  let tooltipStyle: string | undefined = undefined;

  const idToUse = nonNullish(id) ? id : `${idPrefix}-${nextTooltipIdSuffix++}`;

  let isAbsent: boolean;
  $: isAbsent = isNullish($$slots["tooltip-content"]) && !notEmptyString(text);

  $: tooltipStyle = `--tooltip-transform-x: ${tooltipTransformX}px; --tooltip-transform-y: ${tooltipTransformY}px;`;

  const setPosition = () => {
    // The debounce might effectively happen after the component has been destroyed, this is particularly the case in unit tests.
    // That is why we are using a guard to avoid to perform any logic in case the Tooltip does not exist anymore.
    if (destroyed) {
      return;
    }

    if (isAbsent) {
      return;
    }

    if (tooltipComponent === undefined || target === undefined) {
      // Do nothing, we need the elements to be rendered in order to get their size and position to fix the tooltip
      return;
    }

    const container = document.body;

    const { clientWidth, offsetWidth } = container;
    const scrollbarWidth = offsetWidth - clientWidth;

    const { x, y } = translateTooltip({
      containerRect: container.getBoundingClientRect(),
      targetRect: target.getBoundingClientRect(),
      tooltipRect: tooltipComponent.getBoundingClientRect(),
      scrollbarWidth,
      top,
      center,
    });

    // The calculation is based on the current position so the returned
    // transform should be added to the existing one.
    tooltipTransformX += x;
    tooltipTransformY += y;
  };

  const onMouseEnter = () => {
    setPosition();
    targetIsHovered = true;
  };

  const onMouseLeave = () => {
    targetIsHovered = false;
  };

  const moveTooltipToBody = () => {
    // Move tooltip to the body to avoid it being cut off by overflow: hidden.
    nonNullish(tooltipComponent) && document.body.appendChild(tooltipComponent);
  };

  onMount(moveTooltipToBody);

  afterUpdate(moveTooltipToBody);

  let destroyed = false;
  onDestroy(() => {
    destroyed = true;
    // TODO: error  Don't manipulate the DOM directly. The Svelte runtime can get confused if there is a difference between the actual DOM and the DOM expected by the Svelte runtime  svelte/no-dom-manipulating
    // Remove tooltip from the document body where it was placed in onMount.

    tooltipComponent?.remove();
  });
</script>

<!-- See test "should not add whitespace" -->
<!-- prettier-ignore -->
<div class="tooltip-wrapper" data-tid={testId}>
  <div
    bind:this={target}
    class="tooltip-target"
    aria-describedby={idToUse}
    role="presentation"
    title=""
    on:mouseenter={onMouseEnter}
    on:mouseleave={onMouseLeave}><slot /></div
  ><div
    bind:this={tooltipComponent}
    id={idToUse}
    style={tooltipStyle}
    class="tooltip"
    class:noWrap
    class:not-rendered={isAbsent}
    class:top
    class:visible={targetIsHovered}
    role="tooltip"
    >{#if nonNullish(text)}{text}{/if}<slot name="tooltip-content" /></div
  ></div
>

<style lang="scss">
  .tooltip-wrapper {
    position: relative;
    display: var(--tooltip-display, block);
    width: var(--tooltip-width);
  }

  .tooltip {
    z-index: var(--tooltip-z-index);

    position: absolute;
    display: inline-block;

    transform: translate(
      var(--tooltip-transform-x, 0),
      var(--tooltip-transform-y, 0)
    );

    opacity: 0;
    visibility: hidden;
    transition:
      opacity 150ms,
      visibility 150ms;

    padding: 4px 6px;
    border-radius: 4px;
    border: var(--tooltip-border-size) solid var(--tooltip-border-color);

    font-size: var(--font-size-small);

    background: var(--tooltip-background);
    color: var(--tooltip-text-color);

    // limit width
    white-space: pre-wrap;
    max-width: 240px;
    width: max-content;
    overflow-wrap: break-word;

    pointer-events: none;

    &.noWrap {
      white-space: nowrap;
    }

    &.not-rendered {
      display: none;
    }

    &.visible {
      opacity: 1;
      visibility: initial;
    }
  }

  .tooltip-target {
    height: 100%;
  }
</style>

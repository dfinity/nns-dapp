<script lang="ts">
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { onDestroy, setContext, tick } from "svelte";
  import { writable } from "svelte/store";
  import {
    type SegmentContext,
    type SelectedSegment,
    SEGMENT_CONTEXT_KEY,
  } from "$lib/gix/types/segment";

  export let selectedSegmentId: symbol | undefined = undefined;

  const store = writable<SelectedSegment>({
    id: selectedSegmentId,
    element: undefined,
  });

  setContext<SegmentContext>(SEGMENT_CONTEXT_KEY, {
    store,
  });

  $: ($store, (() => (selectedSegmentId = $store.id))());

  let indicator:
    | {
        left: number;
        width: number;
      }
    | undefined = undefined;

  let segment: HTMLElement | undefined | null;

  let selectedElement: HTMLElement | undefined | null;
  $: selectedElement =
    $store.element ?? segment?.querySelector(".segment-button");

  export const initIndicator = async () => {
    if (isNullish(selectedElement)) {
      indicator = undefined;
      return;
    }

    const { parentElement } = selectedElement;

    if (isNullish(parentElement)) {
      indicator = undefined;
      return;
    }

    // wait for segment buttons take their place
    if (isNullish(indicator)) {
      await tick();
    }

    const { left: parentClientLeft } = parentElement.getBoundingClientRect();
    const { left: currentClientLeft, width: currentClientWidth } =
      selectedElement.getBoundingClientRect();

    indicator = {
      left: currentClientLeft - parentClientLeft,
      width: currentClientWidth,
    };
  };

  $: (selectedElement, initIndicator());

  // TODO: support adding segmebt buttons dynamically
  let segmentsCount = 0;
  $: (segment,
    (() =>
      (segmentsCount =
        segment?.querySelectorAll(".segment-button").length ?? 0))());

  // The SegmentButton has a width set to 100%—i.e., not fixed. Therefore, its size might change.
  // Likewise, on mount, when the segment is bound and the indicator is set for the first time, the buttons might not be fully rendered in terms of size yet.
  // Furthermore, if the content of the button dynamically changes—such as in applications that support runtime translations—their size might change.
  // That is why, if the overall size of the component changes, we re-evaluate the position of the indicator.
  let resizeObserver: ResizeObserver | undefined;

  const disconnectResizeObserver = () => resizeObserver?.disconnect();

  onDestroy(disconnectResizeObserver);

  const observeSegmentResize = () => {
    disconnectResizeObserver();

    if (isNullish(segment)) {
      return;
    }

    resizeObserver = new ResizeObserver(initIndicator);
    resizeObserver.observe(segment);
  };

  $: (segment, observeSegmentResize());
</script>

<svelte:window on:resize={initIndicator} />

<div
  bind:this={segment}
  style={`--segments: ${segmentsCount}; ${
    nonNullish(indicator)
      ? `--position: ${indicator.left}px; --width: ${indicator.width}px`
      : ""
  }`}
  class="segment"
>
  {#if nonNullish(indicator)}
    <div class="indicator">
      <div class="indicator-background"></div>
    </div>
  {/if}

  <slot />
</div>

<style lang="scss">
  @use "../styles/mixins/media";

  .segment {
    --segment-gap: var(--padding-0_5x);
    --segment-padding: var(--padding-0_5x);

    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    align-items: center;

    background: var(--input-background);
    color: var(--input-background-contrast);

    padding: var(--segment-padding);
    gap: var(--segment-gap);

    border-radius: var(--border-radius);
    overflow: hidden;

    box-sizing: border-box;
    width: var(--segment-min-width, var(--segment-width, fit-content));
    --segment-min-width: calc(var(--segment-button-width) * var(--segments));

    position: relative;
  }

  .indicator {
    top: calc(
      var(--segment-padding) + 1px
    ); // 1px to compensate translate3d -1px
    left: var(--segment-padding);
    transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: left center;
    position: absolute;
    box-sizing: border-box;
    will-change: transform, opacity;
    pointer-events: none;
    transform: translate3d(
      calc(var(--position, 0) - var(--padding-0_5x)),
      -1px,
      0
    );

    // Calculate the width of the indicator:
    // (100% - [left and right segment paddings] + [all gaps between buttons]) / [number of segments]
    width: calc(
      (
          100% -
            (
              2 * var(--segment-padding) + var(--segment-gap) *
                (var(--segments) - 1)
            )
        ) /
        var(--segments)
    );
    height: calc(100% - var(--segment-padding) * 2);
    border-radius: var(--border-radius);
    background: var(--button-primary);
  }
</style>

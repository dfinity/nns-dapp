<script lang="ts">
  import { afterUpdate } from "svelte";
  /** Used in aria-describedby */
  export let id: string;
  export let text = "";
  export let noWrap: boolean = false;
  let tooltipComponent, rightBoundary, mainWidth;
  let rightEdge = false;

  // if tooltip goes beyond viewport on the right, assign class name of 'rightEdge'
  afterUpdate(() => {
    rightBoundary = tooltipComponent.getBoundingClientRect().right;
    mainWidth = document.querySelector("main")?.clientWidth;
    if (rightBoundary > mainWidth) {
      rightEdge = true;
    }
  });
</script>

<div class="tooltip-wrapper">
  <div class="tooltip-target" aria-describedby={id}>
    <slot />
  </div>
  <div
    class="tooltip"
    role="tooltip"
    {id}
    class:noWrap
    class:rightEdge
    bind:this={tooltipComponent}
  >
    {text}
  </div>
</div>

<style lang="scss">
  .tooltip-wrapper {
    position: relative;
  }

  .tooltip {
    z-index: var(--z-index);

    position: absolute;
    display: inline-block;

    left: 50%;
    bottom: var(--padding-0_5x);
    transform: translate(-50%, 100%);

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
    &.rightEdge {
      left: auto;
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

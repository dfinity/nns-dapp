<script lang="ts">
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
import { claim_component } from "svelte/internal";
import { translate } from "../../utils/i18n.utils";
  /** Used in aria-describedby */
  export let id: string;
  export let text = "";
  export let noWrap: boolean = false;
  let tooltipComponent;
  let rightEdge;
  let leftEdge;
  let innerWidth;

  afterUpdate(() => {
    const {right, left} = tooltipComponent?.getBoundingClientRect();
    const clientWidth = document.querySelector("main")?.clientWidth;

    if (right > clientWidth) {
      rightEdge = true;
      let difference = right - clientWidth;
      // if .rightEdge still overflows, shift left proportionately
      if (difference) {
        tooltipComponent.style.transform = `translate( calc(-50% - ${difference + 1}px), 100%)`;
      }
    } else if (innerWidth >= 904 ) {
      rightEdge = false;
    };

    if (left < 0) {
      leftEdge = true;
    } else {
      leftEdge = false;
    }
  })

</script>

<svelte:window bind:innerWidth/>
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
    class:leftEdge
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

  .leftEdge {
    transform: translate(0, 100%);
    left: -15%;
  }

  .tooltip-target {
    height: 100%;

    &:hover + .tooltip {
      opacity: 1;
      visibility: initial;
    }
  }
</style>

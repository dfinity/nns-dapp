<script lang="ts">
  /** Used in aria-describedby */
  export let id: string;
  export let text = "";
  export let noWrap: boolean = false;
</script>

<div class="tooltip-wrapper">
  <div class="tooltip-target" aria-describedby={id}>
    <slot />
  </div>
  <div class="tooltip" role="tooltip" {id} class:noWrap>{text}</div>
</div>

<style lang="scss">
  .tooltip-wrapper {
    position: relative;
  }

  .tooltip {
    position: absolute;
    display: inline-block;

    left: 50%;
    bottom: var(--padding-half);
    transform: translate(-50%, 100%);

    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms, visibility 150ms;

    padding: 4px 6px;
    border-radius: 4px;

    font-size: var(--font-size-ultra-small);
    background: var(--gray-600);

    color: var(--gray-600-contrast);
    white-space: pre;

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

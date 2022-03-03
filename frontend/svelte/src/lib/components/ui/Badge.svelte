<script lang="ts">
  import type { ProposalColor } from "../../constants/proposals.constants";

  export let color: ProposalColor = undefined;
</script>

<div class={color}>
  <slot />
</div>

<style lang="scss">
  div {
    display: inline-block;

    width: fit-content;

    margin: var(--padding) 0;
    padding: var(--padding);
    border-radius: var(--border-radius);

    border: 2px solid var(--badge-color, currentColor);
    color: var(--badge-color);

    font-size: var(--font-size-h3);

    &.warning {
      --badge-color: var(--yellow-400);
    }

    &.success {
      --badge-color: var(--green-500);
    }

    @media (min-width: 768px) {
      margin: 0;
    }
  }
</style>

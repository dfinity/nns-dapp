<script lang="ts">
  import type { ProposalColor } from "../../constants/proposals.constants";

  export let color: ProposalColor = undefined;
</script>

<div class={color}>
  <slot />
</div>

<style lang="scss">
  div {
    color: var(--badge-color);

    &.warning {
      --badge-color: var(--yellow-400);
    }

    &.success {
      --badge-color: var(--green-500);
    }
  }
</style>

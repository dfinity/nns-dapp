<script lang="ts">
  import type { ProposalColor } from "../../constants/proposals.constants";

  export let color: ProposalColor = undefined;
</script>

<div class={color}>
  <slot />
</div>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  div {
    color: var(--badge-color, var(--background-contrast));
    background: var(--badge-background, var(--background));

    padding: var(--padding-0_5x);
    border-radius: var(--padding-0_5x);

    &.warning {
      --badge-color: var(--warning-emphasis-contrast);
      --badge-background: var(--warning-emphasis);
    }

    &.success {
      --badge-color: var(--green-500-contrast);
      --badge-background: var(--green-500);
    }
  }

  @include media.light-theme() {
    div.warning {
      color: white;
    }
  }
</style>

<script lang="ts">
  import IconFiberNew from "../../icons/IconFiberNew.svelte";
  import { i18n } from "../../stores/i18n";
</script>

<span aria-label={$i18n.core.new}>
  <IconFiberNew />
</span>

<style lang="scss">
  span {
    width: var(--padding-4x);
    height: auto;
    line-height: 0;
    color: var(--primary);

    :global(svg) {
      width: 100%;
      height: auto;
    }
  }
</style>

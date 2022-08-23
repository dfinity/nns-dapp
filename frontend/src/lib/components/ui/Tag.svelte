<script lang="ts">
  import type { Color } from "../../types/theme";

  export let color: Color | undefined = undefined;
  export let tagName: "span" | "h3" | "li" = "span";
</script>

<svelte:element this={tagName} data-tid="tag" class={`${color ?? ""} tag`}
  ><slot /></svelte:element
>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  .tag {
    padding: calc(var(--padding-0_5x) / 2) var(--padding);

    // Default color: Color.PRIMARY
    --badge-color: var(--primary);

    color: var(--badge-color);
    border: 1px solid var(--badge-color);
    border-radius: var(--border-radius-5x);

    height: fit-content;

    // Color.WARNING
    &.warning {
      --badge-color: var(--warning-emphasis);
    }

    // Color.SUCCESS
    &.success {
      --badge-color: var(--positive-emphasis);
    }
  }
</style>

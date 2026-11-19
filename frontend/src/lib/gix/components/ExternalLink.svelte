<script lang="ts">
  import type { Snippet } from "svelte";
  import IconNorthEast from "$lib/gix/icons/IconNorthEast.svelte";

  interface Props {
    href: string;
    alt?: string;
    children?: Snippet;
  }

  let { href, alt = "", children }: Props = $props();
</script>

<a {href} rel="external noopener noreferrer" target="_blank" title={alt}>
  {@render children?.()}
  <IconNorthEast size="16px" />
</a>

<style lang="scss">
  a {
    text-decoration: none;

    :global(svg) {
      margin-left: var(--padding);
      vertical-align: bottom;
    }
  }
</style>

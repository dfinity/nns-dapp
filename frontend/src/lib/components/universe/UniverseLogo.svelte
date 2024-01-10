<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import type { Universe } from "$lib/types/universe";
  import { universeLogoAlt } from "$lib/utils/universe.utils";

  export let universe: Universe;
  export let size: "big" | "medium" | "small" = "small";
  export let framed = false;
  export let horizontalPadding = true;

  let title: string;
  $: title = universeLogoAlt(universe);
</script>

<div class={`${size}`} class:horizontalPadding data-tid="project-logo">
  <Logo src={universe.logo} alt={title} {size} {framed} testId="logo" />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
  }

  .small.horizontalPadding {
    padding: 0 var(--padding);
  }
</style>

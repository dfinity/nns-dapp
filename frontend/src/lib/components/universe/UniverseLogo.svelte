<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import VoteLogo from "$lib/components/universe/VoteLogo.svelte";
  import type { Universe } from "$lib/types/universe";
  import { universeLogoAlt } from "$lib/utils/universe.utils";

  export let universe: Universe | "all-actionable";
  export let size: "big" | "medium" | "small" = "small";
  export let framed = false;
  export let horizontalPadding = true;

  let title: string;
  $: title = universe !== "all-actionable" ? universeLogoAlt(universe) : "";
</script>

<span
  class={`container ${size}`}
  class:horizontalPadding
  data-tid="project-logo"
>
  {#if universe !== "all-actionable"}
    <Logo src={universe.logo} alt={title} {size} {framed} testId="logo" />
  {:else}
    <VoteLogo {size} {framed} />
  {/if}
</span>

<style lang="scss">
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
  }

  .small.horizontalPadding {
    padding: 0 var(--padding);
  }
</style>

<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";
  import Title from "$lib/components/header/Title.svelte";
  import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
  import { SplitContent } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";

  type Props = {
    resetScrollPositionAfterNavigation?: boolean;
    children: Snippet;
  };
  const { resetScrollPositionAfterNavigation = false, children }: Props =
    $props();

  let splitContent: SplitContent | undefined;

  afterNavigate(() => {
    if (resetScrollPositionAfterNavigation && nonNullish(splitContent)) {
      splitContent.resetScrollPosition();
    }
  });
</script>

<div class="container">
  <SplitContent bind:this={splitContent}>
    {#snippet start()}
      <div class="nav">
        <SelectUniverseNav />
      </div>
    {/snippet}

    {#snippet title()}
      <Title />
    {/snippet}

    {#snippet toolbarEnd()}
      <HeaderToolbar />
    {/snippet}

    {#snippet end()}
      {@render children()}
    {/snippet}
  </SplitContent>
</div>

<style lang="scss">
  // Temporarily redefine default values of the SplitContent until the proper redesign is implemented.
  .container {
    display: contents;
    // The height of the SelectUniverseCard is 68px + top padding (12px) + bottom padding (12px).
    --content-start-height: calc(68px + var(--padding-3x));
  }
</style>

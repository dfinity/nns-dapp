<script lang="ts">
  import { SplitContent } from "@dfinity/gix-components";
  import Title from "$lib/components/header/Title.svelte";
  import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";
  import {nonNullish} from "@dfinity/utils";
  import {afterNavigate} from "$app/navigation";

  export let resetScrollPositionAfterNavigation = false;

  let splitContent: SplitContent | undefined;

  afterNavigate(() => {
    if (resetScrollPositionAfterNavigation && nonNullish(splitContent)) {
      splitContent.resetScrollPosition();
    }
  });

</script>

<div class="container">
  <SplitContent bind:this={splitContent}>
    <div class="nav" slot="start">
      <SelectUniverseNav />
    </div>

    <Title slot="title" />

    <HeaderToolbar slot="toolbar-end" />

    <slot slot="end" />
  </SplitContent>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  // Temporarily redefine default values of the SplitContent until the proper redesign is implemented.
  .container {
    display: contents;
    // The height of the SelectUniverseCard is 68px + top padding (12px) + bottom padding (12px).
    --content-start-height: calc(68px + var(--padding-3x));
  }
</style>

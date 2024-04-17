<script lang="ts">
  import { SplitContent } from "@dfinity/gix-components";
  import Title from "$lib/components/header/Title.svelte";
  import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";
</script>

<div class="container">
  <SplitContent>
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
    --content-start-height: calc(92px + var(--padding-2x));
  }
</style>

<script lang="ts">
  import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
  import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
  import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";
  import { BREAKPOINT_LARGE, Nav } from "@dfinity/gix-components";

  let innerWidth = 0;
  let list = false;

  $: list = innerWidth > BREAKPOINT_LARGE;
</script>

<svelte:window bind:innerWidth />

<div class="container">
  <Nav>
    <p class="title" slot="title" data-tid="select-universe-nav-title">
      {$titleTokenSelectorStore}
    </p>

    {#if list}
      <SelectUniverseNavList />
    {:else}
      <div class="select-universe">
        <SelectUniverseDropdown />
      </div>
    {/if}
  </Nav>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .title {
    margin: 0;

    @include media.min-width(large) {
      @include fonts.h3(true);
    }
  }

  // 1. hide Nav title on mobile
  .container {
    --nav-component-title-display: none;
    @include media.min-width(large) {
      --nav-component-title-display: block;
    }
  }
  // 2. add some gap, because the Nav title is hidden on mobile
  .select-universe {
    margin-top: var(--padding-1_5x);
  }
</style>

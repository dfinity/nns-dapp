<script lang="ts">
  import { Nav, BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
  import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
  import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";

  let innerWidth = 0;
  let list = false;

  $: list = innerWidth > BREAKPOINT_LARGE;
</script>

<svelte:window bind:innerWidth />

<Nav>
  <p class="title" slot="title" data-tid="select-universe-nav-title">
    {$titleTokenSelectorStore}
  </p>

  {#if list}
    <SelectUniverseNavList />
  {:else}
    <SelectUniverseDropdown />
  {/if}
</Nav>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .title {
    margin: 0;

    @include media.min-width(large) {
      @include fonts.h3(true);
    }
  }
</style>

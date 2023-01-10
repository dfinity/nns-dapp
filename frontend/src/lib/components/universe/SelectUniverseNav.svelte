<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Nav, BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
  import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";

  let innerWidth = 0;
  let list = false;

  $: list = innerWidth > BREAKPOINT_LARGE;
</script>

<svelte:window bind:innerWidth />

<Nav>
  <p class="title" slot="title" data-tid="select-universe-nav-title">
    {$i18n.universe.select_token}
  </p>

  {#if list}
    <SelectUniverseNavList />
  {:else}
    <SelectUniverseDropdown />
  {/if}
</Nav>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .title {
    @include media.min-width(large) {
      @include fonts.h3(true);
    }
  }
</style>

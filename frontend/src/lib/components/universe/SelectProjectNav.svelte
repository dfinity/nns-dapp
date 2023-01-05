<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Nav } from "@dfinity/gix-components";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
  import SelectProjectList from "$lib/components/universe/SelectProjectList.svelte";
  import SelectProjectNavDropdown from "$lib/components/universe/SelectProjectNavDropdown.svelte";

  let selectedCanisterId: string;
  $: selectedCanisterId = $snsProjectIdSelectedStore.toText();

  let innerWidth = 0;
  let list = false;

  // TODO: not sure if we want to hide/display the components with JS or CSS...
  $: list = innerWidth > 1024;
</script>

<svelte:window bind:innerWidth />

<Nav>
  <p class="title" slot="title">{$i18n.core.pick_a_project}</p>

  {#if list}
    <SelectProjectList {selectedCanisterId} />
  {:else}
    <SelectProjectNavDropdown {selectedCanisterId} />
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

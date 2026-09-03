<script lang="ts">
  import { alfredVisibleStore } from "$lib/stores/alfred.store";
  import { i18n } from "$lib/stores/i18n";
  import { IconSearch } from "@dfinity/gix-components";

  // The panel covers the header with a backdrop while it is open, so this
  // button can only ever open it.
  const open = () => alfredVisibleStore.set(true);
</script>

<button
  aria-label={$i18n.navigation.search}
  class="icon-only toggle"
  data-tid="open-alfred"
  onclick={open}
>
  <IconSearch />
</button>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/header";

  .toggle {
    @include header.button(--primary-tint);
    background-color: var(--sidebar-button-background);
    min-width: 0 !important;
    height: 28px !important;
    width: 28px !important;
  }
</style>

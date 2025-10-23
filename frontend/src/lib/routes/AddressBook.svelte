<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { Island } from "@dfinity/gix-components";

  layoutTitleStore.set({
    title: $i18n.navigation.address_book,
  });
</script>

<Island>
  <main class="legacy">
    <section>
      <!-- Address book content will go here -->
    </section>
  </main>
</Island>

<style lang="scss">
  main {
    padding: var(--padding);
  }
</style>


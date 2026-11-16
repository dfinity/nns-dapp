<script lang="ts">
  import EmptyCards from "$lib/components/common/EmptyCards.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { IconUserLogin, PageBanner } from "@dfinity/gix-components";

  layoutTitleStore.set({
    title: $i18n.navigation.hotkeys,
  });
</script>

<main>
  <div class="content">
    <PageBanner>
      <IconUserLogin slot="image" />
      <svelte:fragment slot="title">{$i18n.navigation.hotkeys}</svelte:fragment>
      <p class="description" slot="description">
        {$i18n.hotkeys.description}
      </p>
      <SignIn slot="actions" />
    </PageBanner>

    <EmptyCards />
  </div>
</main>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>

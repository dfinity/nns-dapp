<script lang="ts">
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { IconAdd, IconPlus, IconUserLogin } from "@dfinity/gix-components";

  layoutTitleStore.set({
    title: $i18n.navigation.address_book,
  });

  const isEmpty = true;
</script>

<IslandWidthMain>
  <div class="content">
    {#if isEmpty}
      <div class="is-empty">
        <IconUserLogin size={144} />
        <div class="text">
          <p class="title">{$i18n.address_book.empty_title}</p>
          <p class="description">{$i18n.address_book.empty_description}</p>
          <button
            data-tid="add-address-button"
            class="primary"
            on:click={() => {}}
          >
            <div class="add-address-button-content">
              <IconAdd size="20" />
              {$i18n.address_book.add_address}
            </div>
          </button>
        </div>
      </div>
    {:else}
      @TODO
    {/if}
  </div>
</IslandWidthMain>

<style lang="scss">
  .is-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    border-radius: var(--border-radius-2x);
    background-color: var(--sidebar-button-background);
    text-align: center;
    gap: var(--padding);

    .title {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .title {
      font-weight: 450;
      font-size: 16px;
      line-height: 20px;
      color: var(--text-description);
    }

    .description {
      max-width: 360px;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      color: var(--text-description);
      margin-bottom: 32px;
    }

    .add-address-button-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
</style>

<script lang="ts">
  import HotkeyCell from "$lib/components/hotkeys/HotkeyCell.svelte";
  import HotkeyNeuronsCell from "$lib/components/hotkeys/HotkeyNeuronsCell.svelte";
  import HotkeyProjectsCell from "$lib/components/hotkeys/HotkeyProjectsCell.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { hotkeysStore } from "$lib/derived/hotkeys.derived";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { listNeurons } from "$lib/services/neurons.services";
  import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import type { HotkeysTableRowData } from "$lib/types/hotkeys";
  import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
  import { IconKey } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import { onMount, untrack } from "svelte";

  layoutTitleStore.set({
    title: $i18n.navigation.hotkeys,
  });

  let pendingLoads = $state(0);
  const requestedSnsRootCanisterIds = new Set<string>();

  const trackLoad = async (load: () => Promise<void>) => {
    pendingLoads += 1;
    try {
      await load();
    } finally {
      pendingLoads -= 1;
    }
  };

  onMount(() => {
    trackLoad(() => listNeurons());
  });

  // The SNS projects can load after the page.
  $effect(() => {
    for (const { rootCanisterId } of $snsProjectsCommittedStore) {
      const rootCanisterIdText = rootCanisterId.toText();
      if (requestedSnsRootCanisterIds.has(rootCanisterIdText)) {
        continue;
      }
      requestedSnsRootCanisterIds.add(rootCanisterIdText);
      untrack(() => trackLoad(() => syncSnsNeurons(rootCanisterId)));
    }
  });

  const isLoading = $derived(
    pendingLoads > 0 || isNullish($neuronsStore.neurons)
  );

  const tableData = $derived(
    $hotkeysStore.map(
      (hotkey): HotkeysTableRowData => ({
        domKey: hotkey.principal,
        hotkey,
      })
    )
  );

  const isEmpty = $derived(!isLoading && tableData.length === 0);

  const columns = [
    {
      title: $i18n.hotkeys.hotkey,
      cellComponent: HotkeyCell,
      alignment: "left",
      templateColumns: ["minmax(max-content, 1fr)"],
    },
    {
      title: $i18n.hotkeys.projects,
      cellComponent: HotkeyProjectsCell,
      alignment: "left",
      templateColumns: ["2fr"],
    },
    {
      title: $i18n.hotkeys.neurons,
      cellComponent: HotkeyNeuronsCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
    // The table does not show a title for the last column.
    {
      title: "",
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ] as unknown as ResponsiveTableColumn<HotkeysTableRowData, string>[];
</script>

<IslandWidthMain>
  <div class="content" data-tid="hotkeys-content">
    {#if isEmpty}
      <div class="is-empty" data-tid="hotkeys-empty">
        <IconKey size="144" />
        <p class="title">{$i18n.hotkeys.empty_title}</p>
        <p class="description">{$i18n.hotkeys.empty_description}</p>
      </div>
    {:else}
      <p class="description">{$i18n.hotkeys.description}</p>
      <ResponsiveTable
        {tableData}
        {columns}
        loading={isLoading && tableData.length === 0}
      />
    {/if}
  </div>
</IslandWidthMain>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  p {
    margin: 0;
  }

  .description {
    color: var(--text-description);
  }

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
      font-weight: 450;
      font-size: 16px;
      line-height: 20px;
    }

    .description {
      max-width: 360px;
      font-size: 14px;
      line-height: 18px;
    }
  }
</style>

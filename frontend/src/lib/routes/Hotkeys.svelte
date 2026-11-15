<script lang="ts">
  import HotkeyActionsCell from "$lib/components/hotkeys/HotkeyActionsCell.svelte";
  import HotkeyCell from "$lib/components/hotkeys/HotkeyCell.svelte";
  import HotkeyNeuronsCell from "$lib/components/hotkeys/HotkeyNeuronsCell.svelte";
  import HotkeyProjectsCell from "$lib/components/hotkeys/HotkeyProjectsCell.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { hotkeysStore } from "$lib/derived/hotkeys.derived";
  import ChangeHotkeyModal from "$lib/modals/hotkeys/ChangeHotkeyModal.svelte";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { listNeurons } from "$lib/services/neurons.services";
  import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import { isLoadingSnsProjectsStore } from "$lib/stores/sns.store";
  import type {
    Hotkey,
    HotkeyChange,
    HotkeysTableRowData,
  } from "$lib/types/hotkeys";
  import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
  import { IconErrorOutline, IconKey } from "@dfinity/gix-components";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { Principal } from "@icp-sdk/core/principal";
  import { onMount, untrack } from "svelte";
  import { get } from "svelte/store";
  import { SvelteSet } from "svelte/reactivity";

  layoutTitleStore.set({
    title: $i18n.navigation.hotkeys,
  });

  // The loads use update calls only, so they end with certified data.
  let pendingLoads = $state(0);
  const requestedSnsRootCanisterIds = new Set<string>();
  const failedUniverseIds = new SvelteSet<string>();

  // Resolves to `true` if the certified neurons loaded.
  const loadNnsNeurons = async (): Promise<boolean> => {
    let certifiedLoaded = false;
    await listNeurons({
      strategy: "update",
      callback: (certified) => {
        certifiedLoaded ||= certified;
      },
    });
    return certifiedLoaded;
  };

  // Resolves to `true` if the certified neurons loaded. A failed load removes the project from the store.
  const loadSnsNeurons = async (
    rootCanisterId: Principal
  ): Promise<boolean> => {
    await syncSnsNeurons(rootCanisterId, { strategy: "update" });
    return get(snsNeuronsStore)[rootCanisterId.toText()]?.certified === true;
  };

  const trackLoad = async (universeId: string) => {
    pendingLoads += 1;
    failedUniverseIds.delete(universeId);
    try {
      const loaded = await (universeId === OWN_CANISTER_ID_TEXT
        ? loadNnsNeurons()
        : loadSnsNeurons(Principal.fromText(universeId)));
      if (!loaded) {
        failedUniverseIds.add(universeId);
      }
    } catch {
      failedUniverseIds.add(universeId);
    } finally {
      pendingLoads -= 1;
    }
  };

  const retryFailedLoads = () => [...failedUniverseIds].forEach(trackLoad);

  onMount(() => {
    trackLoad(OWN_CANISTER_ID_TEXT);
  });

  // The SNS projects can load after the page.
  $effect(() => {
    for (const { rootCanisterId } of $snsProjectsCommittedStore) {
      const rootCanisterIdText = rootCanisterId.toText();
      if (requestedSnsRootCanisterIds.has(rootCanisterIdText)) {
        continue;
      }
      requestedSnsRootCanisterIds.add(rootCanisterIdText);
      untrack(() => trackLoad(rootCanisterIdText));
    }
  });

  const isLoading = $derived(
    pendingLoads > 0 ||
      isNullish($neuronsStore.neurons) ||
      $isLoadingSnsProjectsStore
  );

  let changing = $state<
    { hotkey: Hotkey; type: HotkeyChange["type"] } | undefined
  >();

  const tableData = $derived(
    $hotkeysStore.map(
      (hotkey): HotkeysTableRowData => ({
        domKey: hotkey.principal,
        hotkey,
        rowContext: {
          onReplace: (hotkey) => (changing = { hotkey, type: "replace" }),
          onRemove: (hotkey) => (changing = { hotkey, type: "remove" }),
          actionsDisabled: isLoading,
        },
      })
    )
  );

  const hasFailedLoads = $derived(failedUniverseIds.size > 0);

  const isEmpty = $derived(
    !isLoading && !hasFailedLoads && tableData.length === 0
  );

  const showTable = $derived(isLoading || tableData.length > 0);

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
    {
      title: "",
      cellComponent: HotkeyActionsCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ] as unknown as ResponsiveTableColumn<HotkeysTableRowData, string>[];
</script>

<IslandWidthMain>
  <div class="content" data-tid="hotkeys-content">
    {#if hasFailedLoads}
      <Banner
        testId="hotkeys-load-error"
        title={$i18n.hotkeys.load_error_title}
        text={$i18n.hotkeys.load_error_description}
      >
        <BannerIcon slot="icon" status="error">
          <IconErrorOutline />
        </BannerIcon>
        <button
          slot="actions"
          class="secondary"
          data-tid="retry-button"
          onclick={retryFailedLoads}>{$i18n.hotkeys.retry}</button
        >
      </Banner>
    {/if}
    {#if isEmpty}
      <div class="is-empty" data-tid="hotkeys-empty">
        <IconKey size="144" />
        <p class="title">{$i18n.hotkeys.empty_title}</p>
        <p class="description">{$i18n.hotkeys.empty_description}</p>
      </div>
    {:else if showTable}
      <p class="description">{$i18n.hotkeys.description}</p>
      <ResponsiveTable
        {tableData}
        {columns}
        loading={isLoading && tableData.length === 0}
      />
    {/if}
  </div>
</IslandWidthMain>

{#if nonNullish(changing)}
  <ChangeHotkeyModal
    hotkey={changing.hotkey}
    type={changing.type}
    onChange={(universeIds) => universeIds.forEach(trackLoad)}
    onClose={() => (changing = undefined)}
    {isLoading}
  />
{/if}

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

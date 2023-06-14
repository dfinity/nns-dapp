<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import IconSync from "$lib/components/sync/IconSync.svelte";
  import IconCloud from "$lib/components/sync/IconCloud.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Popover } from "@dfinity/gix-components";
  import { syncStore } from "$lib/stores/sync.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  let visible: boolean | undefined;
  let button: HTMLButtonElement | undefined;

  let label: string;
  let icon: typeof SvelteComponent;

  const syncLabel = (): string => {
    switch ($syncStore) {
      case "error":
        return "Error";
      case "in_progress":
        return "In progress";
      default:
        return "Idle";
    }
  };

  const syncIcon = (): typeof SvelteComponent => {
    if (["in_progress", "pending", "init"].includes($syncStore)) {
      return IconSync;
    }

    return IconCloud;
  };

  $: $syncStore, (label = syncLabel()), (icon = syncIcon());

  const toggle = () => (visible = !visible);
</script>

{#if $authSignedInStore}
  <button
    data-tid="sync-indicator"
    class="icon-only"
    bind:this={button}
    on:click={toggle}
    aria-label={$i18n.header.account_menu}
  >
    <svelte:component this={icon} />
  </button>

  <Popover bind:visible anchor={button} direction="rtl">
    An information about the sync status...
  </Popover>
{/if}

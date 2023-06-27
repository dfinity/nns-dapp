<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { IconSync } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { IconError, Popover } from "@dfinity/gix-components";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { syncOverallStatusStore } from "$lib/derived/sync.derived";
  import { nonNullish } from "@dfinity/utils";
  import { SyncState } from "$lib/types/sync";

  let visible: boolean | undefined;
  let button: HTMLButtonElement | undefined;

  let label: string;
  let description: string;
  let icon: typeof SvelteComponent | undefined;

  const syncLabel = (state: SyncState): string => {
    switch (state) {
      case "error":
        return $i18n.sync.status_error;
      case "in_progress":
        return $i18n.sync.status_in_progress;
      default:
        return $i18n.sync.status_idle;
    }
  };

  const syncDescription = (state: SyncState): string => {
    switch (state) {
      case "error":
        return $i18n.sync.status_error_detailed;
      case "in_progress":
        return $i18n.sync.status_in_progress_detailed;
      default:
        return $i18n.sync.status_idle_detailed;
    }
  };

  const syncIcon = (state: SyncState): typeof SvelteComponent | undefined => {
    switch (state) {
      case "error":
        return IconError;
      case "in_progress":
        return IconSync;
      default:
        return undefined;
    }
  };

  $: label = syncLabel($syncOverallStatusStore);
  $: icon = syncIcon($syncOverallStatusStore);
  $: description = syncDescription($syncOverallStatusStore);

  const toggle = () => (visible = !visible);
</script>

{#if $authSignedInStore && nonNullish(icon)}
  <button
    data-tid="sync-indicator"
    class="icon-only"
    bind:this={button}
    on:click={toggle}
    aria-label={label}
    class:error={$syncOverallStatusStore === "error"}
  >
    <svelte:component this={icon} />
  </button>

  <Popover bind:visible anchor={button} direction="rtl">
    {description}
  </Popover>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/header";

  button {
    @include header.button(--primary-tint);

    margin: 0;
  }

  .error {
    color: var(--negative-emphasis);
  }
</style>

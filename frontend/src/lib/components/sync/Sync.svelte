<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import IconSync from "$lib/components/sync/IconSync.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { IconError, Popover } from "@dfinity/gix-components";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { workersSyncStore } from "$lib/derived/sync.derived";
  import {nonNullish} from "@dfinity/utils";

  let visible: boolean | undefined;
  let button: HTMLButtonElement | undefined;

  let label: string;
  let icon: typeof SvelteComponent | undefined;

  const syncLabel = (): string => {
    switch ($workersSyncStore) {
      case "error":
        return "Error";
      case "in_progress":
        return "In progress";
      default:
        return "Idle";
    }
  };

  const syncIcon = (): typeof SvelteComponent | undefined => {
    if ($workersSyncStore === "in_progress") {
      return IconSync;
    }

    if ($workersSyncStore === "error") {
      return IconError;
    }

    return undefined;
  };

  $: $workersSyncStore, (label = syncLabel()), (icon = syncIcon());

  const toggle = () => (visible = !visible);
</script>

{#if $authSignedInStore && nonNullish(icon)}
  <button
    data-tid="sync-indicator"
    class="icon-only"
    bind:this={button}
    on:click={toggle}
    aria-label={$i18n.header.account_menu}
    class:error={$workersSyncStore === "idle"}
  >
    <svelte:component this={icon} />
  </button>

  <Popover bind:visible anchor={button} direction="rtl">
    An information about the sync status...
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

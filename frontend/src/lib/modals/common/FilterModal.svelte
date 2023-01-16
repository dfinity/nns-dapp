<script lang="ts">
  import { Modal, Spinner } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { Checkbox } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Filter } from "$lib/types/filters";
  import { onMount } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { nonNullish } from "$lib/utils/utils";

  // Source: https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#solution
  type T = $$Generic;
  // `undefined` means the filters are not loaded yet.
  export let filters: Filter<T>[] | undefined;
  export let visible = true;

  let loading: boolean;
  $: loading = filters === undefined;

  onMount(async () => {
    if (filters !== undefined) {
      return;
    }

    startBusy({
      initiator: "load-sns-filters",
    });
  });

  $: loading,
    (() => {
      if (!loading) {
        stopBusy("load-sns-accounts");
      }
    })();

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");

  const onChange = (id: string) => {
    const filter = filters?.find((f) => f.id === id);
    dispatch("nnsChange", { filter });
  };

  const filter = () => {
    dispatch("nnsConfirm");
  };
</script>

{#if nonNullish(filters)}
  <Modal {visible} on:nnsClose role="alert">
    <slot slot="title" name="title" />

    {#if filters}
      <div class="filters">
        {#each filters as { id, name, checked } (id)}
          <Checkbox inputId={id} {checked} on:nnsChange={() => onChange(id)}
            >{name}</Checkbox
          >
        {/each}
      </div>
    {:else}
      <Spinner />
    {/if}

    <svelte:fragment slot="footer">
      <button class="secondary" type="button" data-tid="close" on:click={close}>
        {$i18n.core.cancel}
      </button>
      <button
        class="primary"
        type="button"
        on:click={filter}
        data-tid="apply-filters"
      >
        {$i18n.core.filter}
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<style lang="scss">
  .filters {
    --checkbox-padding: var(--padding-2x) var(--padding) var(--padding-2x);
  }
</style>

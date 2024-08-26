<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal, Tag } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
  import type { Universe } from "$lib/types/universe";
  import { nonNullish } from "@dfinity/utils";

  const dispatch = createEventDispatcher();

  export let universe: Universe | undefined;
</script>

<Modal
  role="alert"
  on:nnsClose
  testId="import-token-remove-confirmation-component"
  disablePointerEvents={true}
>
  <svelte:fragment slot="title">
    {$i18n.import_token.remove_confirmation_title}
  </svelte:fragment>

  <div class="content">
    <div class="headline">
      {#if nonNullish(universe)}<UniversePageSummary {universe} />{/if}
      <Tag>{$i18n.import_token.imported_token}</Tag>
    </div>
    <p>{$i18n.import_token.remove_confirmation_description_1}</p>
    <p>{$i18n.import_token.remove_confirmation_description_2}</p>
    <div class="toolbar">
      <button
        class="secondary"
        data-tid="close-button"
        on:click={() => dispatch("nnsClose")}
      >
        {$i18n.core.cancel}
      </button>

      <button
        data-tid="confirm-button"
        class="primary"
        on:click={() => dispatch("nnsConfirm")}
      >
        {$i18n.core.remove}
      </button>
    </div>
  </div>
</Modal>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    padding: var(--padding-1_5x) var(--padding) 0 var(--padding);
  }

  .headline {
    display: flex;
    gap: var(--padding-0_5x);
  }
</style>

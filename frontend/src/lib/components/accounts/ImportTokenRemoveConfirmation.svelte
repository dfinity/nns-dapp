<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Html, Modal, Tag } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { Universe } from "$lib/types/universe";
  import { nonNullish } from "@dfinity/utils";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";

  export let ledgerCanisterId: Principal;

  let universe: Universe | undefined;
  $: universe = $selectableUniversesStore.find(
    ({ canisterId }) => canisterId === ledgerCanisterId.toText()
  );

  const dispatch = createEventDispatcher();
</script>

<Modal
  role="alert"
  on:nnsClose
  testId="imported-token-remove-confirmation"
  disablePointerEvents={true}
>
  <svelte:fragment slot="title">
    {$i18n.import_token.remove_confirmation_title}
  </svelte:fragment>

  <div class="content">
    {#if nonNullish(universe)}
      <UniversePageSummary slot="start" {universe}>
        <Tag slot="tags" testId="imported-token-tag"
          >{$i18n.import_token.imported_token}</Tag
        >
      </UniversePageSummary>
    {/if}
    <p><Html text={$i18n.import_token.remove_confirmation_description} /></p>
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      data-tid="close-button"
      on:click={() => dispatch("nnsClose")}
    >
      {$i18n.core.back}
    </button>

    <button
      data-tid="confirm-button"
      class="primary"
      on:click={() => dispatch("nnsConfirm")}
    >
      {$i18n.core.remove}
    </button>
  </div>
</Modal>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    margin-bottom: var(--padding-4x);
  }
</style>

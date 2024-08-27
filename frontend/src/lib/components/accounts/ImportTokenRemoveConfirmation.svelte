<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
  import type { Universe } from "$lib/types/universe";
  import { nonNullish } from "@dfinity/utils";
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { Tag } from "@dfinity/gix-components";

  export let universe: Universe | undefined;
</script>

<ConfirmationModal
  testId="import-token-remove-confirmation-component"
  on:nnsClose
  on:nnsConfirm
  yesLabel={$i18n.core.remove}
>
  <div class="content">
    <h4>{$i18n.import_token.remove_confirmation_description_1}</h4>
    <div class="headline">
      {#if nonNullish(universe)}<UniversePageSummary {universe} />{/if}
      <Tag>{$i18n.import_token.imported_token}</Tag>
    </div>
    <p class="description text_small">
      {$i18n.import_token.remove_confirmation_description_2}
    </p>
  </div>
</ConfirmationModal>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .headline {
    display: flex;
    gap: var(--padding-0_5x);
  }
</style>

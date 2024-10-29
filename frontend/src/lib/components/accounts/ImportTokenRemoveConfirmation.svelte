<script lang="ts">
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Universe } from "$lib/types/universe";
  import { Tag } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";

  export let tokenToRemove:
    | { universe: Universe }
    | { ledgerCanisterId: Principal };
</script>

<ConfirmationModal
  testId="import-token-remove-confirmation-component"
  on:nnsClose
  on:nnsConfirm
  yesLabel={$i18n.core.remove}
>
  <div class="content">
    <h4>{$i18n.import_token.remove_confirmation_header}</h4>
    <div class="token">
      {#if "universe" in tokenToRemove}
        <UniverseSummary universe={tokenToRemove.universe} />
      {:else}
        <span class="value" data-tid="ledger-canister-id"
          >{tokenToRemove.ledgerCanisterId.toText()}</span
        >
      {/if}
      <Tag>{$i18n.import_token.imported_token}</Tag>
    </div>
    <p class="description text_small">
      {$i18n.import_token.remove_confirmation_description}
    </p>
  </div>
</ConfirmationModal>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .token {
    display: flex;
    gap: var(--padding-0_5x);
  }
</style>

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";
  import type { Universe } from "$lib/types/universe";
  import { nonNullish } from "@dfinity/utils";
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { Tag } from "@dfinity/gix-components";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { removeImportedTokens } from "$lib/services/imported-tokens.services";
  import { AppPath } from "$lib/constants/routes.constants";
  import { goto } from "$app/navigation";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher } from "svelte";

  export let universe: Universe | undefined = undefined;
  export let ledgerCanisterId: Principal;

  const dispatch = createEventDispatcher();
  const removeImportedToken = async () => {
    startBusy({
      initiator: "import-token-removing",
      labelKey: "import_token.removing",
    });

    try {
      const importedTokens = $importedTokensStore.importedTokens ?? [];
      const { success } = await removeImportedTokens({
        tokensToRemove: importedTokens.filter(
          ({ ledgerCanisterId: id }) =>
            id.toText() === ledgerCanisterId.toText()
        ),
        importedTokens,
      });

      if (success) {
        dispatch("nnsClose");
        goto(AppPath.Tokens);
      }
    } finally {
      stopBusy("import-token-removing");
    }
  };
</script>

<ConfirmationModal
  testId="import-token-remove-confirmation-component"
  on:nnsClose
  on:nnsConfirm={removeImportedToken}
  yesLabel={$i18n.core.remove}
>
  <div class="content">
    <h4>{$i18n.import_token.remove_confirmation_header}</h4>
    <div class="token">
      {#if nonNullish(universe)}<UniverseSummary {universe} />{/if}
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

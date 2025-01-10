<script lang="ts">
  import ImportTokenForm from "$lib/components/accounts/ImportTokenForm.svelte";
  import { matchLedgerIndexPair } from "$lib/services/icrc-index.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { addIndexCanister } from "$lib/services/imported-tokens.services";
  import { Modal } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { isNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let ledgerCanisterId: Principal;

  const dispatch = createEventDispatcher();

  let indexCanisterId: Principal | undefined;

  const nnsSubmit = async () => {
    // Just for type safety. This should never happen.
    if (
      isNullish(ledgerCanisterId) ||
      isNullish(indexCanisterId) ||
      isNullish($importedTokensStore.importedTokens)
    ) {
      return;
    }

    try {
      startBusy({
        initiator: "import-token-updating",
        labelKey: "import_token.updating",
      });

      if (
        !(await matchLedgerIndexPair({
          ledgerCanisterId,
          indexCanisterId,
        }))
      ) {
        return;
      }

      const { success } = await addIndexCanister({
        ledgerCanisterId,
        indexCanisterId,
        importedTokens: $importedTokensStore.importedTokens,
      });
      if (success) {
        dispatch("nnsClose");
      }
    } finally {
      stopBusy("import-token-updating");
    }
  };
</script>

<Modal testId="add-index-canister-modal-component" on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.import_token.add_index_canister}</svelte:fragment
  >
  <ImportTokenForm
    addIndexCanisterMode
    bind:ledgerCanisterId
    bind:indexCanisterId
    on:nnsClose
    on:nnsSubmit={nnsSubmit}
  />
</Modal>

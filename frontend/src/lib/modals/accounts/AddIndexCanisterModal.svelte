<script lang="ts">
  import ImportTokenForm from "$lib/components/accounts/ImportTokenForm.svelte";
  import { matchLedgerIndexPair } from "$lib/services/icrc-index.services";
  import { addIndexCanister } from "$lib/services/imported-tokens.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { Modal } from "@dfinity/gix-components";
  import type { Principal } from "@icp-sdk/core/principal";
  import { isNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let ledgerCanisterId: Principal;

  const dispatch = createEventDispatcher();

  const close = () => dispatch("nnsClose");

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
        close();
      }
    } finally {
      stopBusy("import-token-updating");
    }
  };
</script>

<Modal testId="add-index-canister-modal-component" onClose={close}>
  {#snippet title()}{$i18n.import_token.add_index_canister}{/snippet}
  <ImportTokenForm
    addIndexCanisterMode
    bind:ledgerCanisterId
    bind:indexCanisterId
    on:nnsClose
    on:nnsSubmit={nnsSubmit}
  />
</Modal>

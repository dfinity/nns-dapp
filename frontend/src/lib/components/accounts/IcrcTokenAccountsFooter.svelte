<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { selectedIcrcTokenUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { openIcrcTokenModal } from "$lib/utils/modals.utils";
  import type { Principal } from "@dfinity/principal";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { toastsError } from "$lib/stores/toasts.store";

  let ledgerCanisterId: Principal | undefined;
  $: ledgerCanisterId = $selectedIcrcTokenUniverseIdStore;

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish(ledgerCanisterId)
    ? $tokensStore[ledgerCanisterId.toText()]?.token
    : undefined;

  const openSendModal = () => {
    if (isNullish(ledgerCanisterId) || isNullish(token)) {
      toastsError({ labelKey: "error.icrc_token_load" });
      return;
    }
    openIcrcTokenModal({
      type: "icrc-send",
      data: {
        universeId: ledgerCanisterId,
        token,
        loadTransactions: false,
      },
    });
  };
</script>

{#if nonNullish($selectedIcrcTokenUniverseIdStore)}
  <Footer testId="icrc-token-accounts-footer-component">
    <button
      class="primary full-width"
      on:click={openSendModal}
      data-tid="open-new-icrc-token-transaction">{$i18n.accounts.send}</button
    >
    <!-- TODO: Add Receive button GIX-2124 -->
  </Footer>
{/if}

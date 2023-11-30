<script lang="ts">
  import { isNullish } from "@dfinity/utils";
  import Footer from "$lib/components/layout/Footer.svelte";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { toastsError } from "$lib/stores/toasts.store";
  import { openIcrcTokenModal } from "$lib/utils/modals.utils";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import IC_LOGO from "$lib/assets/icp.svg";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import { createEventDispatcher } from "svelte";

  export let universeId: UniverseCanisterId;
  export let token: IcrcTokenMetadata;
  export let account: Account;
  export let reloadAccount: () => Promise<void>;

  const openSendModal = () => {
    if (isNullish(universeId) || isNullish(token)) {
      toastsError({ labelKey: "error.icrc_token_load" });
      return;
    }
    openIcrcTokenModal({
      type: "icrc-send",
      data: {
        universeId,
        token,
        loadTransactions: false,
        sourceAccount: account,
      },
    });
  };
</script>

<Footer testId="ckbtc-wallet-footer-component">
  <button
    class="primary full-width"
    on:click={openSendModal}
    data-tid="open-new-icrc-token-transaction">{$i18n.accounts.send}</button
  >

  <ReceiveButton
    type="icrc-receive"
    {account}
    reload={reloadAccount}
    testId="receive-icrc"
    {universeId}
    logo={$selectedUniverseStore?.logo ?? IC_LOGO}
    tokenSymbol={token?.symbol}
  />
</Footer>

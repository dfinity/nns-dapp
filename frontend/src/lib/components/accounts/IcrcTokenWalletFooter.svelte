<script lang="ts">
  import IC_LOGO from "$lib/assets/icp.svg";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { openIcrcTokenModal } from "$lib/utils/modals.utils";
  import type { Principal } from "@dfinity/principal";
  import { isNullish } from "@dfinity/utils";

  export let ledgerCanisterId: Principal;
  export let token: IcrcTokenMetadata;
  export let account: Account;
  export let reloadAccount: () => Promise<void>;
  export let reloadTransactions: () => Promise<void>;

  const reloadSourceAccount = async () => {
    await reloadAccount();
    await reloadTransactions();
  };

  const openSendModal = () => {
    if (isNullish(ledgerCanisterId) || isNullish(token)) {
      toastsError({ labelKey: "error.icrc_token_load" });
      return;
    }
    openIcrcTokenModal({
      type: "icrc-send",
      data: {
        ledgerCanisterId,
        token,
        loadTransactions: false,
        sourceAccount: account,
        reloadSourceAccount,
      },
    });
  };
</script>

<Footer testId="icrc-wallet-footer-component">
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
    logo={$selectedUniverseStore?.logo ?? IC_LOGO}
    tokenSymbol={token?.symbol}
  />
</Footer>

<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
  import { nonNullish } from "@dfinity/utils";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import { syncAccounts } from "$lib/services/accounts.services";
  import { ENABLE_ICP_ICRC } from "$lib/stores/feature-flags.store";

  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);

  // TODO: for performance reason use `loadBalance` to reload specific account
  const reload = async () => await syncAccounts($ENABLE_ICP_ICRC);
</script>

<TestIdWrapper testId="nns-accounts-footer-component">
  {#if modal === "NewTransaction"}
    <IcpTransactionModal on:nnsClose={closeModal} />
  {/if}

  {#if nonNullish($icpAccountsStore)}
    <Footer>
      <button
        class="primary full-width"
        on:click={openNewTransaction}
        data-tid="open-new-transaction">{$i18n.accounts.send}</button
      >

      <ReceiveButton type="nns-receive" canSelectAccount {reload} />
    </Footer>
  {/if}
</TestIdWrapper>

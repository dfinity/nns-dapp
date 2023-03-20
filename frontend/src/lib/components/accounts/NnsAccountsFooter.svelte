<script lang="ts">
  import { accountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
  import { nonNullish } from "@dfinity/utils";
  import Receive from "$lib/components/accounts/ReceiveButton.svelte";

  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);
</script>

{#if modal === "NewTransaction"}
  <IcpTransactionModal on:nnsClose={closeModal} />
{/if}

{#if nonNullish($accountsStore)}
  <Footer>
    <button
      class="primary full-width"
      on:click={openNewTransaction}
      data-tid="open-new-transaction">{$i18n.accounts.send}</button
    >

    <Receive type="nns-receive" canSelectAccount />
  </Footer>
{/if}

<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { Toolbar } from "@dfinity/gix-components";
  import Footer from "../common/Footer.svelte";
  import IcpTransactionModal from "../../modals/accounts/IcpTransactionModal.svelte";
  import { snsProjectAccountsStore } from "../../derived/sns/sns-project-accounts.derived";

  // TODO: Support adding subaccounts
  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);
</script>

{#if modal === "NewTransaction"}
  <IcpTransactionModal on:nnsClose={closeModal} />
{/if}

{#if $snsProjectAccountsStore !== undefined}
  <Footer>
    <Toolbar>
      <button
        class="primary full-width"
        on:click={openNewTransaction}
        data-tid="open-new-sns-transaction"
        >{$i18n.accounts.new_transaction}</button
      >
    </Toolbar>
  </Footer>
{/if}

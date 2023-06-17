<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { toastsError } from "$lib/stores/toasts.store";

  // TODO: Support adding subaccounts
  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);

  const reload = async () => {
    if (isNullish($snsOnlyProjectStore)) {
      toastsError({
        labelKey: "error__sns.sns_reload_no_universe",
      });
      return;
    }

    await syncSnsAccounts({ rootCanisterId: $snsOnlyProjectStore });
  };
</script>

{#if modal === "NewTransaction"}
  <SnsTransactionModal on:nnsClose={closeModal} />
{/if}

{#if nonNullish($snsProjectAccountsStore)}
  <Footer>
    <button
      class="primary full-width"
      on:click={openNewTransaction}
      data-tid="open-new-sns-transaction">{$i18n.accounts.send}</button
    >

    <ReceiveButton
      type="sns-receive"
      canSelectAccount
      testId="receive-sns"
      {reload}
    />
  </Footer>
{/if}

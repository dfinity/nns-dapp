<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import {
    cancelPollAccounts,
    loadBalance,
    pollAccounts,
  } from "$lib/services/icp-accounts.services";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import { ActionType, type Action } from "$lib/types/actions";
  import type { UserToken } from "$lib/types/tokens-page";
  import { findAccount } from "$lib/utils/accounts.utils";
  import { openAccountsModal } from "$lib/utils/modals.utils";
  import { IconAdd } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import { onDestroy, onMount } from "svelte";

  onMount(() => {
    pollAccounts();
  });

  onDestroy(() => {
    cancelPollAccounts();
  });

  export let userTokensData: UserToken[];

  const openAddAccountModal = () => {
    openAccountsModal({
      type: "add-icp-account",
      data: undefined,
    });
  };

  const handleAction = ({ detail }: { detail: Action }) => {
    const account = findAccount({
      identifier: detail.data.accountIdentifier,
      accounts: $nnsAccountsListStore,
    });
    // Edge case: There wouldn't be a row to click on without an account
    if (isNullish(account)) {
      toastsError({
        labelKey: "error.account_not_found",
        substitutions: {
          $account_identifier: detail.data.accountIdentifier ?? "",
        },
      });
      return;
    }

    if (detail.type === ActionType.Receive) {
      openAccountsModal({
        type: "nns-receive",
        data: {
          account,
          reload: () => loadBalance({ accountIdentifier: account.identifier }),
          canSelectAccount: false,
          universeId: detail.data.universeId,
          tokenSymbol: detail.data.token.symbol,
          logo: detail.data.logo,
        },
      });
    }

    if (detail.type === ActionType.Send) {
      openAccountsModal({
        type: "nns-send",
        data: {
          account,
        },
      });
    }
  };
</script>

<TestIdWrapper testId="accounts-body">
  <TokensTable
    {userTokensData}
    firstColumnHeader={$i18n.tokens.accounts_header}
    on:nnsAction={handleAction}
  >
    <div
      slot="last-row"
      class="add-account-row"
      data-tid="add-account-row"
      on:click={openAddAccountModal}
      on:keypress={openAddAccountModal}
      role="button"
      aria-label={$i18n.accounts.add_account}
      tabindex="0"
    >
      <!-- Skip tabindex the button because it's already in the row -->
      <button tabindex="-1" class="ghost with-icon"
        ><IconAdd />{$i18n.accounts.add_account}</button
      >
    </div>
  </TokensTable>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";

  .add-account-row {
    @include interaction.tappable;

    grid-column: 1 / -1;

    display: grid;
    align-items: center;
    justify-content: center;

    padding: var(--padding-2x);

    background: var(--table-row-background);
    border: 1px dashed var(--primary);
    border-radius: 0 0 var(--border-radius) var(--border-radius);

    &:hover {
      background-color: var(--table-row-background-hover);
    }
  }
</style>

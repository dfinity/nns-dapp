<script lang="ts">
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import NnsAddAccount from "$lib/components/accounts/NnsAddAccount.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { onDestroy, onMount } from "svelte";
  import {
    cancelPollAccounts,
    loadBalance,
    pollAccounts,
  } from "$lib/services/icp-accounts.services";
  import { ICPToken } from "@dfinity/utils";
  import type { UserToken } from "$lib/types/tokens-page";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { IconAdd } from "@dfinity/gix-components";
  import { openAccountsModal } from "$lib/utils/modals.utils";
  import { ActionType, type Action } from "$lib/types/actions";
  import { findAccount } from "$lib/utils/accounts.utils";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { toastsError } from "$lib/stores/toasts.store";

  onMount(() => {
    if (!$ENABLE_MY_TOKENS) {
      pollAccounts();
    }
  });

  onDestroy(() => {
    cancelPollAccounts();
  });

  // TODO: Remove default value when we remove the feature flag
  export let userTokensData: UserToken[] = [];

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

{#if $ENABLE_MY_TOKENS}
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
        tabindex={userTokensData.length + 1}
      >
        <button class="ghost with-icon"
          ><IconAdd />{$i18n.accounts.add_account}</button
        >
      </div>
    </TokensTable>
  </TestIdWrapper>
{:else}
  <div class="card-grid" data-tid="accounts-body">
    {#if nonNullish($icpAccountsStore?.main)}
      <!-- Workaround: Type checker does not get $accountsStore.main is defined here -->
      {@const mainAccount = $icpAccountsStore.main}

      <AccountCard account={mainAccount} token={ICPToken}
        >{$i18n.accounts.main}</AccountCard
      >
      {#each $icpAccountsStore.subAccounts ?? [] as subAccount}
        <AccountCard account={subAccount} token={ICPToken}
          >{subAccount.name}</AccountCard
        >
      {/each}
      {#each $icpAccountsStore.hardwareWallets ?? [] as walletAccount}
        <AccountCard account={walletAccount} token={ICPToken}
          >{walletAccount.name}</AccountCard
        >
      {/each}

      <NnsAddAccount />
    {:else}
      <SkeletonCard size="medium" />
    {/if}
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";
  @use "../themes/mixins/button";

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

    & button.with-icon {
      @include button.with-icon;
    }
  }
</style>

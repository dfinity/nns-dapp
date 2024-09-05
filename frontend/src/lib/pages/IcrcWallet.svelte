<script lang="ts">
  import IcrcTokenWalletFooter from "$lib/components/accounts/IcrcTokenWalletFooter.svelte";
  import IcrcWalletPage from "$lib/components/accounts/IcrcWalletPage.svelte";
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
  import NoTransactions from "$lib/components/accounts/NoTransactions.svelte";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { selectedIcrcTokenUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { tokensByUniverseIdStore } from "$lib/derived/tokens.derived";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import type { CanisterId } from "$lib/types/canister";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type { WalletStore } from "$lib/types/wallet.context";
  import { isImportedToken as checkImportedToken } from "$lib/utils/imported-tokens.utils";
  import { Html, IconCanistersPage, IconPlus } from "@dfinity/gix-components";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { writable } from "svelte/store";
  import AddIndexCanisterModal from "$lib/modals/accounts/AddIndexCanisterModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let accountIdentifier: string | undefined | null = undefined;

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  let indexCanisterId: CanisterId | undefined;
  $: indexCanisterId = nonNullish($selectedIcrcTokenUniverseIdStore)
    ? $icrcCanistersStore[$selectedIcrcTokenUniverseIdStore.toText()]
        ?.indexCanisterId
    : undefined;

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish($selectedIcrcTokenUniverseIdStore)
    ? $tokensByUniverseIdStore[$selectedIcrcTokenUniverseIdStore.toText()]
    : undefined;

  let transactions: IcrcWalletTransactionsList;
  let wallet: IcrcWalletPage;

  const reloadAccount = async () => await wallet.reloadAccount?.();
  const reloadTransactions = () => transactions?.reloadTransactions?.();

  let isImportedToken = false;
  $: isImportedToken = checkImportedToken({
    ledgerCanisterId: $selectedIcrcTokenUniverseIdStore,
    importedTokens: $importedTokensStore.importedTokens,
  });

  let showAddIndexCanisterModal = false;
</script>

<TestIdWrapper testId="icrc-wallet-component">
  <IcrcWalletPage
    {accountIdentifier}
    {token}
    ledgerCanisterId={$selectedIcrcTokenUniverseIdStore}
    {indexCanisterId}
    {selectedAccountStore}
    bind:this={wallet}
    {reloadTransactions}
  >
    <svelte:fragment slot="page-content">
      {#if isImportedToken && isNullish(indexCanisterId)}
        <div class="no-index-canister">
          <div class="icon">
            <IconCanistersPage />
          </div>
          <p class="description">
            <Html text={$i18n.import_token.add_index_description} />
          </p>
          <button
            data-tid="add-index-canister-button"
            class="ghost with-icon add-index-canister-button"
            on:click={() => (showAddIndexCanisterModal = true)}
          >
            <IconPlus />{$i18n.import_token.add_index_canister}
          </button>
        </div>
      {:else if isNullish($selectedAccountStore.account) || isNullish($selectedIcrcTokenUniverseIdStore) || isNullish(indexCanisterId)}
        <NoTransactions />
      {:else}
        <IcrcWalletTransactionsList
          account={$selectedAccountStore.account}
          {indexCanisterId}
          ledgerCanisterId={$selectedIcrcTokenUniverseIdStore}
          {token}
          bind:this={transactions}
        />
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="footer-actions">
      {#if nonNullish($selectedAccountStore.account) && nonNullish(token) && nonNullish($selectedIcrcTokenUniverseIdStore)}
        <IcrcTokenWalletFooter
          ledgerCanisterId={$selectedIcrcTokenUniverseIdStore}
          account={$selectedAccountStore.account}
          {token}
          {reloadAccount}
          {reloadTransactions}
        />
      {/if}
    </svelte:fragment>
  </IcrcWalletPage>

  {#if showAddIndexCanisterModal && nonNullish($selectedIcrcTokenUniverseIdStore)}
    <AddIndexCanisterModal
      on:nnsClose={() => (showAddIndexCanisterModal = false)}
      ledgerCanisterId={$selectedIcrcTokenUniverseIdStore}
    />
  {/if}
</TestIdWrapper>

<style lang="scss">
  .no-index-canister {
    padding-top: var(--padding-3x);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--padding-3x);
    text-align: center;

    .icon {
      max-width: calc(var(--padding) * 18);
    }

    p {
      max-width: calc(var(--padding) * 38);
    }
  }

  .add-index-canister-button {
    gap: var(--padding);
    color: var(--primary);
  }
</style>

<script lang="ts">
  import { Island, Spinner } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { writable } from "svelte/store";
  import type { WalletStore } from "$lib/types/wallet.context";
  import { debugSelectedAccountStore } from "$lib/derived/debug.derived";
  import { findAccount, hasAccounts } from "$lib/utils/accounts.utils";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { TokenAmount, isNullish, nonNullish } from "@dfinity/utils";
  import {
    loadCkBTCAccounts,
    syncCkBTCAccounts,
  } from "$lib/services/ckbtc-accounts.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import CkBTCWalletFooter from "$lib/components/accounts/CkBTCWalletFooter.svelte";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import {
    selectedCkBTCUniverseIdStore,
    selectedUniverseStore,
  } from "$lib/derived/selected-universe.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import BitcoinAddress from "$lib/components/accounts/BitcoinAddress.svelte";
  import CkBTCWalletActions from "$lib/components/accounts/CkBTCWalletActions.svelte";
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import { loadCkBTCInfo } from "$lib/services/ckbtc-info.services";
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import WalletPageHeader from "$lib/components/accounts/WalletPageHeader.svelte";
  import WalletPageHeading from "$lib/components/accounts/WalletPageHeading.svelte";

  export let accountIdentifier: string | undefined | null = undefined;

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);

  let transactions: CkBTCTransactionsList;

  // e.g. is called from "Receive" modal after user click "Done"
  const reloadAccount = async () => {
    if (isNullish($selectedCkBTCUniverseIdStore)) {
      return;
    }

    await loadCkBTCAccounts({ universeId: $selectedCkBTCUniverseIdStore });
    await loadAccount($selectedCkBTCUniverseIdStore);

    reloadTransactions();
  };

  // e.g. when a function such as a transfer is called and which also reload the data and populate the stores after execution
  const reloadAccountFromStore = () => {
    setSelectedAccount();
    reloadTransactions();
  };

  const reloadOnlyAccountFromStore = () => setSelectedAccount();

  // transactions?.reloadTransactions?.() returns a promise.
  // However, the UI displays skeletons while loading and the user can proceed with other operations during this time.
  // That is why we do not need to wait for the promise to resolve here.
  const reloadTransactions = () => transactions?.reloadTransactions?.();

  const goBack = (): Promise<void> => goto(AppPath.Accounts);

  const setSelectedAccount = () => {
    selectedAccountStore.set({
      account: findAccount({
        identifier: accountIdentifier,
        accounts: nonNullish($selectedCkBTCUniverseIdStore)
          ? $icrcAccountsStore[$selectedCkBTCUniverseIdStore.toText()]
              ?.accounts ?? []
          : [],
      }),
      neurons: [],
    });
  };

  const loadAccount = async (
    universeId: UniverseCanisterId
  ): Promise<{
    state: "loaded" | "not_found" | "unknown";
  }> => {
    setSelectedAccount();

    // We found an account in store for the provided account identifier, all data are set
    if (nonNullish($selectedAccountStore.account)) {
      return { state: "loaded" };
    }

    // Accounts are loaded in store but no account identifier is matching
    if (hasAccounts($icrcAccountsStore[universeId.toText()]?.accounts ?? [])) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_found, {
          $account_identifier: accountIdentifier ?? "",
        }),
      });

      await goBack();
      return { state: "not_found" };
    }

    return { state: "unknown" };
  };

  let loaded = false;

  const loadData = async (universeId: UniverseCanisterId | undefined) => {
    // Universe is not yet loaded
    if (isNullish(universeId)) {
      return;
    }

    // This will display a spinner each time we search and load an account
    // It will also re-create a new component for the list of transactions which per extension will trigger fetching those
    loaded = false;

    const { state } = await loadAccount(universeId);

    // The account was loaded or was not found even though accounts are already loaded in store
    if (state !== "unknown") {
      loaded = true;
      return;
    }

    // Maybe the accounts were just not loaded yet in store, so we try to load the accounts in store
    await syncCkBTCAccounts({ universeId });

    // And finally try to set the account again
    await loadAccount(universeId);

    loaded = true;
  };

  $: accountIdentifier,
    (async () => await loadData($selectedCkBTCUniverseIdStore))();

  let canMakeTransactions = false;
  $: canMakeTransactions =
    nonNullish($selectedCkBTCUniverseIdStore) &&
    hasAccounts(
      $icrcAccountsStore[$selectedCkBTCUniverseIdStore.toText()]?.accounts ?? []
    ) &&
    nonNullish($ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore.toText()]) &&
    nonNullish($ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]);

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  $: (async () =>
    await loadCkBTCInfo({
      universeId: $selectedCkBTCUniverseIdStore,
      minterCanisterId: canisters?.minterCanisterId,
    }))();
</script>

<Island testId="ckbtc-wallet-component">
  <main class="legacy" data-tid="ckbtc-wallet">
    <section>
      {#if loaded && nonNullish(canisters) && nonNullish($selectedAccountStore.account) && nonNullish($selectedCkBTCUniverseIdStore) && nonNullish(token)}
        <IcrcBalancesObserver
          universeId={$selectedCkBTCUniverseIdStore}
          accounts={[$selectedAccountStore.account]}
          reload={reloadOnlyAccountFromStore}
        >
          <WalletPageHeader
            universe={$selectedUniverseStore}
            walletAddress={$selectedAccountStore.account.identifier}
          />
          <WalletPageHeading
            accountName={$selectedAccountStore.account.name ??
              $i18n.accounts.main}
            balance={TokenAmount.fromE8s({
              amount: $selectedAccountStore.account.balanceE8s,
              token: token?.token,
            })}
          >
            <CkBTCWalletActions
              reload={reloadAccount}
              minterCanisterId={canisters.minterCanisterId}
            />
          </WalletPageHeading>

          <Separator spacing="none" />

          <!-- Transactions and the explanation go together. -->
          <div>
            <BitcoinAddress
              account={$selectedAccountStore.account}
              universeId={$selectedCkBTCUniverseIdStore}
              minterCanisterId={canisters.minterCanisterId}
              reload={reloadAccount}
            />

            <CkBTCTransactionsList
              bind:this={transactions}
              account={$selectedAccountStore.account}
              universeId={$selectedCkBTCUniverseIdStore}
              indexCanisterId={canisters.indexCanisterId}
              token={token?.token}
            />
          </div>
        </IcrcBalancesObserver>
      {:else}
        <Spinner />
      {/if}
    </section>
  </main>

  {#if canMakeTransactions}
    <CkBTCWalletFooter
      store={selectedAccountStore}
      {reloadAccount}
      {reloadAccountFromStore}
    />
  {/if}
</Island>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }
</style>

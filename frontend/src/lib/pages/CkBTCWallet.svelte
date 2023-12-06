<script lang="ts">
  import { hasAccounts } from "$lib/utils/accounts.utils";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import CkBTCWalletFooter from "$lib/components/accounts/CkBTCWalletFooter.svelte";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import CkBTCInfoCard from "$lib/components/accounts/CkBTCInfoCard.svelte";
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import { loadCkBTCInfo } from "$lib/services/ckbtc-info.services";
  import IcrcWalletPage from "$lib/components/accounts/IcrcWalletPage.svelte";
  import { writable } from "svelte/store";
  import type { WalletStore } from "$lib/types/wallet.context";
  import { loadAccounts } from "$lib/services/wallet-accounts.services";

  export let accountIdentifier: string | undefined | null = undefined;

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  let transactions: CkBTCTransactionsList;
  let wallet: IcrcWalletPage;

  const reloadAccount = async () => {
    if (isNullish($selectedCkBTCUniverseIdStore)) {
      return;
    }

    await loadAccounts({ universeId: $selectedCkBTCUniverseIdStore });
    await wallet.reloadAccount?.();
  };

  // e.g. when a function such as a transfer is called and which also reload the data and populate the stores after execution
  const reloadAccountFromStore = () => {
    wallet.setSelectedAccount();
    reloadTransactions();
  };

  // transactions?.reloadTransactions?.() returns a promise.
  // However, the UI displays skeletons while loading and the user can proceed with other operations during this time.
  // That is why we do not need to wait for the promise to resolve here.
  const reloadTransactions = () => transactions?.reloadTransactions?.();

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  let canMakeTransactions = false;
  $: canMakeTransactions =
    nonNullish($selectedCkBTCUniverseIdStore) &&
    hasAccounts(
      $icrcAccountsStore[$selectedCkBTCUniverseIdStore.toText()]?.accounts ?? []
    ) &&
    nonNullish($ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore.toText()]) &&
    nonNullish($ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]);

  $: (async () =>
    await loadCkBTCInfo({
      universeId: $selectedCkBTCUniverseIdStore,
      minterCanisterId: canisters?.minterCanisterId,
    }))();
</script>

<IcrcWalletPage
  testId="ckbtc-wallet-component"
  {accountIdentifier}
  token={token?.token}
  selectedUniverseId={$selectedCkBTCUniverseIdStore}
  {selectedAccountStore}
  bind:this={wallet}
  {reloadTransactions}
>
  <svelte:fragment slot="info-card">
    {#if nonNullish($selectedAccountStore.account) && nonNullish($selectedCkBTCUniverseIdStore) && nonNullish(canisters)}
      <CkBTCInfoCard
        account={$selectedAccountStore.account}
        universeId={$selectedCkBTCUniverseIdStore}
        minterCanisterId={canisters.minterCanisterId}
        reload={reloadAccount}
      />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="page-content">
    {#if nonNullish($selectedAccountStore.account) && nonNullish($selectedCkBTCUniverseIdStore) && nonNullish(canisters)}
      <CkBTCTransactionsList
        bind:this={transactions}
        account={$selectedAccountStore.account}
        universeId={$selectedCkBTCUniverseIdStore}
        indexCanisterId={canisters.indexCanisterId}
        token={token?.token}
      />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="footer-actions">
    {#if canMakeTransactions}
      <CkBTCWalletFooter
        store={selectedAccountStore}
        {reloadAccount}
        {reloadAccountFromStore}
      />
    {/if}
  </svelte:fragment>
</IcrcWalletPage>

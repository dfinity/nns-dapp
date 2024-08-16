<script lang="ts">
  import { goto } from "$app/navigation";
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import WalletPageHeader from "$lib/components/accounts/WalletPageHeader.svelte";
  import WalletPageHeading from "$lib/components/accounts/WalletPageHeading.svelte";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { debugSelectedAccountStore } from "$lib/derived/debug.derived";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { syncAccounts as syncWalletAccounts } from "$lib/services/icrc-accounts.services";
  import { i18n } from "$lib/stores/i18n";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type { WalletStore } from "$lib/types/wallet.context";
  import {
    findAccountOrDefaultToMain,
    hasAccounts,
  } from "$lib/utils/accounts.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    IconDots,
    Island,
    Popover,
    Spinner,
    Tag,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { TokenAmountV2, isNullish, nonNullish } from "@dfinity/utils";
  import type { Writable } from "svelte/store";
  import { accountsPathStore } from "$lib/derived/paths.derived";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { removeImportedTokens } from "$lib/services/imported-tokens.services";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import LinkToDashboardCanister from "$lib/components/common/LinkToDashboardCanister.svelte";
  import { isImportedToken as checkImportedToken } from "$lib/utils/imported-tokens.utils";

  export let testId: string;
  export let accountIdentifier: string | undefined | null = undefined;
  export let ledgerCanisterId: Principal | undefined;
  export let token: IcrcTokenMetadata | undefined = undefined;
  export let selectedAccountStore: Writable<WalletStore>;
  export let reloadTransactions: () => Promise<void>;

  debugSelectedAccountStore(selectedAccountStore);

  const reloadOnlyAccountFromStore = () => setSelectedAccount();

  const goBack = async (): Promise<void> => goto(AppPath.Tokens);

  // e.g. is called from "Receive" modal after user click "Done"
  export const reloadAccount = async () => {
    if (isNullish(ledgerCanisterId)) {
      return;
    }

    await loadAccount(ledgerCanisterId);

    // transactions?.reloadTransactions?.() returns a promise.
    // However, the UI displays skeletons while loading and the user can proceed with other operations during this time.
    // That is why we do not need to wait for the promise to resolve here.
    reloadTransactions();
  };

  export const setSelectedAccount = () => {
    const accounts = nonNullish(ledgerCanisterId)
      ? $icrcAccountsStore[ledgerCanisterId.toText()]?.accounts ?? []
      : [];
    const account = findAccountOrDefaultToMain({
      identifier: accountIdentifier,
      accounts,
    });
    selectedAccountStore.set({
      account,
      neurons: [],
    });
  };

  export const loadAccount = async (
    ledgerCanisterId: Principal
  ): Promise<{
    state: "loaded" | "not_found" | "unknown";
  }> => {
    setSelectedAccount();

    // We found an account in store for the provided account identifier, all data are set
    if (nonNullish($selectedAccountStore.account)) {
      return { state: "loaded" };
    }

    // Accounts are loaded in store but no account identifier is matching
    if (
      hasAccounts($icrcAccountsStore[ledgerCanisterId.toText()]?.accounts ?? [])
    ) {
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

  const loadData = async ({
    ledgerCanisterId,
    isSignedIn,
  }: {
    ledgerCanisterId: Principal | undefined;
    isSignedIn: boolean;
  }) => {
    // Universe is not yet loaded
    if (isNullish(ledgerCanisterId)) {
      return;
    }

    if (!isSignedIn) {
      // nothing to load
      loaded = true;
      return;
    }

    // This will display a spinner each time we search and load an account
    // It will also re-create a new component for the list of transactions which per extension will trigger fetching those
    loaded = false;

    const { state } = await loadAccount(ledgerCanisterId);

    // The account was loaded or was not found even though accounts are already loaded in store
    if (state !== "unknown") {
      loaded = true;
      return;
    }

    // Maybe the accounts were just not loaded yet in store, so we try to load the accounts in store
    await syncWalletAccounts({ ledgerCanisterId });

    // And finally try to set the account again
    await loadAccount(ledgerCanisterId);

    loaded = true;
  };

  $: accountIdentifier,
    (async () =>
      await loadData({
        ledgerCanisterId,
        isSignedIn: $authSignedInStore,
      }))();

  const remove = async ({
    detail,
  }: CustomEvent<{ ledgerCanisterId: Principal }>) => {
    console.log("removeImportedToken", detail.ledgerCanisterId);

    startBusy({
      initiator: "import-token-removing",
      labelKey: "import_token.removing",
    });

    const importedTokens = $importedTokensStore.importedTokens ?? [];
    const { success } = await removeImportedTokens({
      tokensToRemove: importedTokens.filter(
        ({ ledgerCanisterId: id }) =>
          id.toText() === detail.ledgerCanisterId.toText()
      ),
      importedTokens,
    });

    stopBusy("import-token-removing");

    if (success) {
      goto($accountsPathStore);
    }
  };

  let moreButton: HTMLButtonElement | undefined;
  let morePopupVisible = false;

  let isImportedToken = false;
  $: isImportedToken = checkImportedToken({
    ledgerCanisterId,
    importedTokens: $importedTokensStore.importedTokens,
  });
</script>

<TestIdWrapper {testId}>
  <Island>
    <main class="legacy">
      <section>
        {#if loaded && nonNullish(ledgerCanisterId)}
          {#if nonNullish($selectedAccountStore.account) && nonNullish(token)}
            <IcrcBalancesObserver
              {ledgerCanisterId}
              accounts={[$selectedAccountStore.account]}
              reload={reloadOnlyAccountFromStore}
            />
          {/if}
          <WalletPageHeader
            universe={$selectedUniverseStore}
            walletAddress={$selectedAccountStore.account?.identifier}
            on:nnsRemove={remove}
            on:nnsMore={() => console.log("icrc")}
          >
            <svelte:fragment slot="tags">
              {#if isImportedToken}
                <Tag testId="imported-token-tag"
                  >{$i18n.import_token.imported_token}</Tag
                >
              {/if}
            </svelte:fragment>
            <svelte:fragment slot="actions">
              {#if nonNullish(ledgerCanisterId)}
                <button
                  bind:this={moreButton}
                  class="icon-only"
                  data-tid="more-button"
                  on:click={() => (morePopupVisible = true)}
                >
                  <IconDots />
                </button>
              {/if}
            </svelte:fragment>
          </WalletPageHeader>
          <WalletPageHeading
            accountName={$selectedAccountStore.account?.name ??
              $i18n.accounts.main}
            balance={nonNullish($selectedAccountStore.account) &&
            nonNullish(token)
              ? TokenAmountV2.fromUlps({
                  amount: $selectedAccountStore.account.balanceUlps,
                  token,
                })
              : undefined}
          >
            <slot name="header-actions" />
            <SignInGuard />
          </WalletPageHeading>

          {#if $$slots["info-card"]}
            <div class="content-cell-island info-card">
              <slot name="info-card" />
            </div>
          {/if}

          <Separator spacing="none" />

          <!-- Transactions and the explanation go together. -->
          <div>
            <slot name="page-content" />
          </div>
        {:else}
          <Spinner />
        {/if}
      </section>
    </main>

    <slot name="footer-actions" />
  </Island>

  {#if nonNullish(ledgerCanisterId)}
    <Popover
      bind:visible={morePopupVisible}
      anchor={moreButton}
      direction="rtl"
      invisibleBackdrop
    >
      <LinkToDashboardCanister canisterId={ledgerCanisterId} />
    </Popover>
  {/if}
</TestIdWrapper>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }

  .info-card {
    background-color: var(--island-card-background);
  }
</style>

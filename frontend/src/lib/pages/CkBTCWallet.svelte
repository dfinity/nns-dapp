<script lang="ts">
  import { Island } from "@dfinity/gix-components";
  import Summary from "$lib/components/summary/Summary.svelte";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { writable } from "svelte/store";
  import { WALLET_CONTEXT_KEY, type WalletContext, type WalletStore } from "$lib/types/wallet.context";
  import { debugSelectedAccountStore } from "$lib/derived/debug.derived";
  import { setContext } from "svelte/internal";
  import { findAccount } from "$lib/utils/accounts.utils";
  import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import { loadCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";

  export let accountIdentifier: string | undefined | null = undefined;

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  const goBack = (): Promise<void> => goto(AppPath.Accounts);

  let requestLoadAccounts = false;

  const loadAccount = async () => {
    selectedAccountStore.set({
      account: findAccount({
        identifier: accountIdentifier,
        accounts: $ckBTCAccountsStore.accounts,
      }),
      neurons: [],
    });

    // We found an account in store for the provided account identifier, all data are set
    if (nonNullish($selectedAccountStore.account)) {
      return;
    }

    // Accounts are loaded in store but no account identifier is matching
    // or
    // We loaded once the accounts and, it loaded no accounts. In any case, we do not want to load again
    if ($ckBTCAccountsStore.accounts.length > 0 || requestLoadAccounts) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_found, {
          $account_identifier: accountIdentifier ?? "",
        }),
      });

      await goBack();
      return;
    }

    // Maybe the accounts are just not loaded yet, so we try to load
    await loadCkBTCAccounts({});
  }

  $: accountIdentifier, $ckBTCAccountsStore.accounts, (async () => loadAccount())();
</script>

<Island>
  <main class="legacy" data-tid="sns-wallet">
    <section>
      <Summary />

      <WalletSummary />

      <Separator />
    </section>
  </main>
</Island>
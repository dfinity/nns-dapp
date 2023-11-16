<script lang="ts">
  import type { Account } from "$lib/types/account";
  import type { Transaction as NnsTransaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import {
    mapNnsTransaction,
    toUiTransaction,
  } from "$lib/utils/transactions.utils";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import TransactionCard from "./TransactionCard.svelte";
  import { ICPToken } from "@dfinity/utils";
  import type { Transaction } from "$lib/types/transaction";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import type { Principal } from "@dfinity/principal";
  import type { Readable } from "svelte/store";
  import { authStore } from "$lib/stores/auth.store";

  export let account: Account;
  export let transaction: NnsTransaction;
  export let toSelfTransaction = false;

  // Subaccounts have no principal, but they belong to the II user.
  let accountPrincipal: Principal | undefined;
  $: accountPrincipal =
    account.principal ?? $authStore.identity?.getPrincipal();

  // Used to identify transactions related to a Swap.
  let swapCanisterAccountsStore: Readable<Set<string>>;
  $: swapCanisterAccountsStore =
    createSwapCanisterAccountsStore(accountPrincipal);

  let uiTransaction: UiTransaction | undefined;

  $: account,
    transaction,
    (() => {
      try {
        const transactionData = mapNnsTransaction({
          transaction,
          toSelfTransaction,
          account,
          swapCanisterAccounts: $swapCanisterAccountsStore,
        });
        uiTransaction = toUiTransaction({
          transaction: transactionData,
          toSelfTransaction,
          token: ICPToken,
          transactionNames: $i18n.transaction_names,
        });
      } catch (err: unknown) {
        uiTransaction = undefined;
        toastsError(
          err instanceof Error
            ? { labelKey: err.message }
            : { labelKey: "error.unknown", err }
        );
      }
    })();
</script>

{#if uiTransaction !== undefined}
  <TransactionCard transaction={uiTransaction} />
{/if}

<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { mapIcpTransaction } from "$lib/utils/transactions.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import TransactionCard from "./TransactionCard.svelte";
  import { ICPToken } from "@dfinity/utils";
  import type { Transaction } from "$lib/types/transaction";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import type { Principal } from "@dfinity/principal";
  import type { Readable } from "svelte/store";
  import { authStore } from "$lib/stores/auth.store";
  import type { TransactionWithId } from "@junobuild/ledger";

  export let account: Account;
  export let transaction: TransactionWithId;
  export let toSelfTransaction = false;

  // Subaccounts have no principal, but they belong to the II user.
  let accountPrincipal: Principal | undefined;
  $: accountPrincipal =
    account.principal ?? $authStore.identity?.getPrincipal();

  // Used to identify transactions related to a Swap.
  let swapCanisterAccountsStore: Readable<Set<string>>;
  $: swapCanisterAccountsStore =
    createSwapCanisterAccountsStore(accountPrincipal);

  let transactionData: Transaction | undefined;

  $: account,
    transaction,
    (() => {
      try {
        transactionData = mapIcpTransaction({
          transaction,
          toSelfTransaction,
          account,
          swapCanisterAccounts: $swapCanisterAccountsStore,
        });
      } catch (err: unknown) {
        transactionData = undefined;
        toastsError(
          err instanceof Error
            ? { labelKey: err.message }
            : { labelKey: "error.unknown", err }
        );
      }
    })();
</script>

{#if transactionData !== undefined}
  <TransactionCard
    transaction={transactionData}
    {toSelfTransaction}
    token={ICPToken}
  />
{/if}

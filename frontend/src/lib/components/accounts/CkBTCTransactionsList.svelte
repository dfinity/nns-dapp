<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { onMount } from "svelte";
  import { loadCkBTCAccountNextTransactions } from "$lib/services/ckbtc-transactions.services";
  import { IcrcTransactionData } from "$lib/types/transaction";
  import { sortTransactions } from "$lib/utils/icrc-transactions.utils";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import { CKBTC_INDEX_CANISTER_ID } from "$lib/constants/canister-ids.constants";

  export let account: Account;

  let loading = true;

  const loadTransactions = async () => {
    loading = true;
    await loadCkBTCAccountNextTransactions({
      account
    });
    loading = false;
  };

  onMount(async () => await loadTransactions());

  let transactions: IcrcTransactionData[];
  $: transactions = sortTransactions(
    $icrcTransactionsStore[CKBTC_INDEX_CANISTER_ID.toText()]?.[account.identifier]
      ?.transactions
  );
</script>

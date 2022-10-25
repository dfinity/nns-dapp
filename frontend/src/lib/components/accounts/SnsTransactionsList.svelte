<script lang="ts">
  import { loadAccountTransactions } from "$lib/services/sns-accounts.services";
  import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { onMount } from "svelte";

  export let account: Account;
  export let rootCanisterId: Principal;

  onMount(() => {
    loadAccountTransactions({
      account,
      rootCanisterId,
    });
  });

  $: transactions = $snsTransactionsStore[rootCanisterId.toText()];
</script>

<div />

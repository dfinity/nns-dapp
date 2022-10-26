<script lang="ts">
  import { loadAccountNextTransactions } from "$lib/services/sns-transactions.services";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { onMount } from "svelte";

  export let account: Account;
  export let rootCanisterId: Principal;

  onMount(() => {
    loadAccountNextTransactions({
      account,
      rootCanisterId,
    });
  });

  // TODO: GIX-996 Render transactions.
</script>

<div data-tid="sns-transactions-list" />

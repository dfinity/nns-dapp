<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { onMount } from "svelte";

  export let account: Account;

  let loading = true;

  const loadTransactions = async () => {
    loading = true;
    // load
    loading = false;
  };

  onMount(async () => await loadTransactions());
</script>

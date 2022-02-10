<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import AccountCard from "../../components/accounts/AccountCard.svelte";
  import Spinner from "../../components/ui/Spinner.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";

  export let main: Account;
  const dispatch = createEventDispatcher();
  const chooseAccount = () => {
    dispatch("nnsSelectAccount", main);
  };
</script>

<h4>{$i18n.neurons.my_accounts}</h4>
{#if main}
  <AccountCard
    role="button"
    showCopyIcon={false}
    on:click={chooseAccount}
    account={main}>{$i18n.accounts.main}</AccountCard
  >
{:else}
  <Spinner />
{/if}

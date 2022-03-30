<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import AccountCard from "./AccountCard.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import type { Unsubscriber } from "svelte/types/runtime/store";

  const dispatch = createEventDispatcher();
  const chooseAccount = (selectedAccount: Account) => {
    dispatch("nnsSelectAccount", { selectedAccount });
  };

  let mainAccount: Account | undefined;

  const unsubscribeAccounts: Unsubscriber = accountsStore.subscribe(
    (accountStore) => {
      mainAccount = accountStore?.main;
    }
  );

  onDestroy(unsubscribeAccounts);
</script>

<div class="wizard-list">
  <h4>{$i18n.neurons.my_accounts}</h4>
  {#if mainAccount}
    <!-- Needed mainAccount && because TS didn't learn that `mainAccount` is present in the click listener -->
    <AccountCard
      role="button"
      on:click={() => mainAccount && chooseAccount(mainAccount)}
      account={mainAccount}>{$i18n.accounts.main}</AccountCard
    >
    {#if $accountsStore.subAccounts}
      {#each $accountsStore.subAccounts as subAccount}
        <AccountCard
          role="button"
          on:click={() => chooseAccount(subAccount)}
          account={subAccount}>{subAccount.name}</AccountCard
        >
      {/each}
    {/if}
  {:else}
    <!-- TODO: https://dfinity.atlassian.net/browse/L2-411 Add Text Skeleton while loading -->
    <Spinner />
  {/if}
</div>

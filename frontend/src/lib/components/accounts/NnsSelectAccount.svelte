<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import AccountCard from "./AccountCard.svelte";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { ICPToken } from "@dfinity/nns";

  export let disableSelection = false;
  export let filterIdentifier: string | undefined = undefined;
  export let displayTitle = false;
  export let hideHardwareWalletAccounts = false;

  const dispatch = createEventDispatcher();
  const chooseAccount = (selectedAccount: Account) => {
    dispatch("nnsSelectAccount", { selectedAccount });
  };

  let mainAccount: Account | undefined;
  $: mainAccount = $accountsStore?.main;

  let subAccounts: Account[];
  $: subAccounts = ($accountsStore?.subAccounts ?? []).filter(
    ({ identifier }: Account) => identifier !== filterIdentifier
  );

  let hardwareWalletAccounts: Account[];
  $: hardwareWalletAccounts = ($accountsStore?.hardwareWallets ?? []).filter(
    ({ identifier }: Account) => identifier !== filterIdentifier
  );

  let showTitle = false;
  $: showTitle =
    displayTitle &&
    (subAccounts?.length > 0 ||
      (hardwareWalletAccounts?.length > 0 && !hideHardwareWalletAccounts));
</script>

<div
  class:disabled={disableSelection}
  data-tid="select-account-screen"
  class="legacy"
>
  {#if mainAccount}
    {#if showTitle}
      <h4>{$i18n.accounts.my_accounts}</h4>
    {/if}

    {#if filterIdentifier !== mainAccount.identifier}
      <!-- Needed mainAccount && because TS didn't learn that `mainAccount` is present in the click listener -->
      <AccountCard
        role="button"
        on:click={() => mainAccount && chooseAccount(mainAccount)}
        account={mainAccount}
        token={ICPToken}>{$i18n.accounts.main}</AccountCard
      >
    {/if}

    {#each subAccounts as subAccount}
      <AccountCard
        role="button"
        on:click={() => chooseAccount(subAccount)}
        account={subAccount} token={ICPToken}>{subAccount.name}</AccountCard
      >
    {/each}

    {#if !hideHardwareWalletAccounts}
      {#each hardwareWalletAccounts as hardwareWalletAccount}
        <AccountCard
          role="button"
          on:click={() => chooseAccount(hardwareWalletAccount)}
          account={hardwareWalletAccount} token={ICPToken}
          >{hardwareWalletAccount.name}</AccountCard
        >
      {/each}
    {/if}
  {:else}
    <SkeletonCard />
    <SkeletonCard />
  {/if}
</div>

<style lang="scss">
  .disabled {
    --disabled-card-opacity: 0.2;

    h4 {
      opacity: var(--disabled-card-opacity);
    }

    :global(article) {
      pointer-events: none;
      opacity: var(--disabled-card-opacity);
    }
  }
</style>

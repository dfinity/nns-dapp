<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import AccountCard from "./AccountCard.svelte";
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import SkeletonCard from "../ui/SkeletonCard.svelte";

  export let disableSelection: boolean = false;
  export let filterIdentifier: string | undefined = undefined;
  export let displayTitle: boolean = false;

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

  let showTitle: boolean = false;
  $: showTitle = displayTitle && (subAccounts?.length > 0 || hardwareWalletAccounts?.length > 0)
</script>

<div class="wizard-list" class:disabled={disableSelection}>
  {#if mainAccount}
    {#if showTitle}
      <h4>{$i18n.accounts.my_accounts}</h4>
    {/if}

    {#if filterIdentifier !== mainAccount.identifier}
      <!-- Needed mainAccount && because TS didn't learn that `mainAccount` is present in the click listener -->
      <AccountCard
        role="button"
        on:click={() => mainAccount && chooseAccount(mainAccount)}
        account={mainAccount}>{$i18n.accounts.main}</AccountCard
      >
    {/if}

    {#each subAccounts as subAccount}
      <AccountCard
        role="button"
        on:click={() => chooseAccount(subAccount)}
        account={subAccount}>{subAccount.name}</AccountCard
      >
    {/each}

    {#each hardwareWalletAccounts as hardwareWalletAccount}
      <AccountCard
        role="button"
        on:click={() => chooseAccount(hardwareWalletAccount)}
        account={hardwareWalletAccount}
        >{hardwareWalletAccount.name}</AccountCard
      >
    {/each}
  {:else}
    <SkeletonCard />
    <SkeletonCard />
  {/if}
</div>

<style lang="scss">
  :global(article:first-of-type) {
    margin-top: var(--padding);
  }

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

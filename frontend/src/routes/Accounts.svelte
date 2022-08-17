<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "../lib/stores/accounts.store";
  import type { AccountsStore } from "../lib/stores/accounts.store";
  import ICPComponent from "../lib/components/ic/ICP.svelte";
  import AccountCard from "../lib/components/accounts/AccountCard.svelte";
  import { i18n } from "../lib/stores/i18n";
  import { Toolbar } from "@dfinity/gix-components";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "../lib/constants/routes.constants";
  import AddAcountModal from "../lib/modals/accounts/AddAccountModal.svelte";
  import { ICP } from "@dfinity/nns";
  import { formatICP, sumICPs } from "../lib/utils/icp.utils";
  import NewTransactionModal from "../lib/modals/accounts/NewTransactionModal.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import Footer from "../lib/components/common/Footer.svelte";
  import Tooltip from "../lib/components/ui/Tooltip.svelte";
  import { replacePlaceholders } from "../lib/utils/i18n.utils";

  let accounts: AccountsStore | undefined;

  const unsubscribe: Unsubscriber = accountsStore.subscribe(
    async (storeData: AccountsStore) => (accounts = storeData)
  );

  const cardClick = (identifier: string) =>
    routeStore.navigate({ path: `${AppPath.Wallet}/${identifier}` });

  onDestroy(unsubscribe);

  let modal: "AddAccountModal" | "NewTransaction" | undefined = undefined;
  const openAddAccountModal = () => (modal = "AddAccountModal");
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);

  let totalBalance: ICP;
  let totalICP: string;
  const zeroICPs = ICP.fromE8s(BigInt(0));
  $: {
    totalBalance = sumICPs(
      accounts?.main?.balance || zeroICPs,
      ...(accounts?.subAccounts || []).map(({ balance }) => balance),
      ...(accounts?.hardwareWallets || []).map(({ balance }) => balance)
    );
    totalICP = formatICP({
      value: totalBalance.toE8s(),
      detailed: true,
    });
  }
</script>

<main class="legacy">
  <section data-tid="accounts-body">
    <div class="title">
      <h1>{$i18n.accounts.title}</h1>

      {#if accounts?.main}
        <Tooltip
          id="wallet-total-icp"
          text={replacePlaceholders($i18n.accounts.current_balance_total, {
            $amount: totalICP,
          })}
        >
          <ICPComponent icp={totalBalance} />
        </Tooltip>
      {/if}
    </div>

    {#if accounts?.main?.identifier}
      <AccountCard
        role="link"
        on:click={() => cardClick(accounts?.main?.identifier ?? "")}
        showCopy
        account={accounts?.main}>{$i18n.accounts.main}</AccountCard
      >
      {#each accounts.subAccounts || [] as subAccount}
        <AccountCard
          role="link"
          on:click={() => cardClick(subAccount.identifier)}
          showCopy
          account={subAccount}>{subAccount.name}</AccountCard
        >
      {/each}
      {#each accounts.hardwareWallets || [] as walletAccount}
        <AccountCard
          role="link"
          on:click={() => cardClick(walletAccount.identifier)}
          showCopy
          account={walletAccount}>{walletAccount.name}</AccountCard
        >
      {/each}
    {:else}
      <SkeletonCard />
    {/if}
  </section>
</main>

{#if modal === "AddAccountModal"}
  <AddAcountModal on:nnsClose={closeModal} />
{/if}
{#if modal === "NewTransaction"}
  <NewTransactionModal on:nnsClose={closeModal} />
{/if}

{#if accounts}
  <Footer>
    <Toolbar>
      <button
        class="primary full-width"
        on:click={openNewTransaction}
        data-tid="open-new-transaction">{$i18n.accounts.new_transaction}</button
      >
      <button
        class="primary full-width"
        on:click={openAddAccountModal}
        data-tid="open-add-account-modal">{$i18n.accounts.add_account}</button
      >
    </Toolbar>
  </Footer>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .title {
    display: block;
    width: 100%;

    margin-bottom: var(--padding-2x);

    --icp-font-size: var(--font-size-h1);

    // Minimum height of ICP value + ICP label (ICP component)
    min-height: calc(
      var(--line-height-standard) * (var(--icp-font-size) + 1rem)
    );

    @include media.min-width(medium) {
      display: inline-flex;
      justify-content: space-between;
      align-items: baseline;
    }
  }
</style>

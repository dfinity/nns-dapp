<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "../stores/accounts.store";
  import type { AccountsStore } from "../stores/accounts.store";
  import AmountDisplay from "../components/ic/AmountDisplay.svelte";
  import AccountCard from "../components/accounts/AccountCard.svelte";
  import { i18n } from "../stores/i18n";
  import { routeStore } from "../stores/route.store";
  import { AppPath } from "../constants/routes.constants";
  import { TokenAmount } from "@dfinity/nns";
  import { formatICP, sumTokenAmounts } from "../utils/icp.utils";
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";
  import Tooltip from "../components/ui/Tooltip.svelte";
  import { replacePlaceholders } from "../utils/i18n.utils";

  let accounts: AccountsStore | undefined;

  const unsubscribe: Unsubscriber = accountsStore.subscribe(
    async (storeData: AccountsStore) => (accounts = storeData)
  );

  const cardClick = (identifier: string) =>
    routeStore.navigate({ path: `${AppPath.Wallet}/${identifier}` });

  onDestroy(unsubscribe);

  let totalBalance: TokenAmount;
  let totalICP: string;
  const zeroICPs = TokenAmount.fromE8s({
    amount: BigInt(0),
    token: accounts?.main?.balance.token,
  });
  $: {
    totalBalance = sumTokenAmounts(
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
          <AmountDisplay amount={totalBalance} />
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
      {#each accounts.subAccounts ?? [] as subAccount}
        <AccountCard
          role="link"
          on:click={() => cardClick(subAccount.identifier)}
          showCopy
          account={subAccount}>{subAccount.name}</AccountCard
        >
      {/each}
      {#each accounts.hardwareWallets ?? [] as walletAccount}
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

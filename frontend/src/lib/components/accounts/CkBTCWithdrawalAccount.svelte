<script lang="ts">
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { loadCkBTCWithdrawalAccount } from "$lib/services/ckbtc-withdrawal-accounts.services";
  import { onMount } from "svelte";
  import {
    type CkBTCBTCWithdrawalAccount,
    ckBTCWithdrawalAccountsStore,
  } from "$lib/stores/ckbtc-withdrawal-accounts.store";
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { Spinner, IconClock, IconCheck } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";

  const reloadAccount = async () => {
    if (isNullish($selectedCkBTCUniverseIdStore)) {
      return;
    }

    await loadCkBTCWithdrawalAccount({
      universeId: $selectedCkBTCUniverseIdStore,
    });
  };

  const loadAccount = async () => {
    if (isNullish($selectedCkBTCUniverseIdStore)) {
      return;
    }

    // We do not reload the account if user navigate back and forth
    if (
      nonNullish(
        $ckBTCWithdrawalAccountsStore[$selectedCkBTCUniverseIdStore.toText()]
      )
    ) {
      return;
    }

    await reloadAccount();
  };

  onMount(loadAccount);

  let account: CkBTCBTCWithdrawalAccount | undefined = undefined;
  $: account = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCWithdrawalAccountsStore[$selectedCkBTCUniverseIdStore.toText()]
        ?.account
    : undefined;

  let loading = false;
  $: loading =
    nonNullish(account) &&
    (isNullish(account.balance) || isNullish(account.identifier));

  let accountBalance: TokenAmount;
  $: accountBalance =
    account?.balance ??
    (TokenAmount.fromString({ amount: "0", token: ICPToken }) as TokenAmount);

  let detailedAccountBalance: string;
  $: detailedAccountBalance = formatToken({
    value: accountBalance.toE8s(),
    detailed: true,
  });

  let transfersToBeCompleted: boolean | undefined;
  $: account,
    loading,
    (() => {
      transfersToBeCompleted =
        loading || isNullish(account)
          ? undefined
          : accountBalance.toE8s() > 0n;
    })();

  // Important: We do not explicitely use Svelte transition because according our test, use these here leads to breaking the routing.
  // i.e. after navigating to details page getting two spit-pane div within the DOM.
  let visibility: "visible" | "fade" | "hidden" = "hidden";
  $: transfersToBeCompleted,
    (() => {
      if (isNullish(transfersToBeCompleted)) {
        visibility = "visible";
        return;
      }

      if (transfersToBeCompleted === true) {
        visibility = "visible";
        return;
      }

      // First set "fade" for animation purpose, then "hidden" to remove from the DOM
      setTimeout(() => {
        visibility = "fade";
        setTimeout(() => (visibility = "hidden"), 200);
      }, 1800);
    })();
</script>

{#if visibility !== "hidden" && nonNullish(account)}
  <button
    class="card"
    class:complete={transfersToBeCompleted}
    class:ok={transfersToBeCompleted === false}
    class:fade={visibility === "fade"}
    data-tid="open-restart-convert-ckbtc-to-btc"
    disabled={transfersToBeCompleted !== true}
  >
    {#if loading}
      <div>
        <Spinner inline />
      </div>
      <span class="value">{$i18n.ckbtc.checking_incomplete_btc_transfers}</span>
    {:else if transfersToBeCompleted === true}
      <div><IconClock size="36px" /></div>
      <span class="value"
        >{replacePlaceholders($i18n.ckbtc.click_to_complete_btc_transfers, {
          $amount: detailedAccountBalance,
        })}</span
      >
    {:else}
      <div><IconCheck size="36px" /></div>
      <span class="value">{$i18n.ckbtc.all_btc_transfers_complete}</span>
    {/if}
  </button>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  button {
    padding: var(--padding-2x) var(--padding-4x);
    gap: var(--padding-2x);

    @include media.min-width(medium) {
      padding: var(--padding-2x);
    }

    opacity: 1;
    transition: opacity ease-out var(--animation-time-normal);

    &.fade {
      opacity: 0;
    }
  }

  div {
    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;

    min-width: var(--padding-4x);
  }

  span {
    text-align: left;
  }

  .complete {
    :global(svg) {
      color: var(--negative-emphasis);
    }
  }

  .ok {
    :global(svg) {
      color: var(--positive-emphasis);
    }
  }
</style>

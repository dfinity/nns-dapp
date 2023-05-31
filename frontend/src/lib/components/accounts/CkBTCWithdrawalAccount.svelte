<script lang="ts">
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { loadCkBTCWithdrawalAccount } from "$lib/services/ckbtc-withdrawal-accounts.services";
  import { onMount } from "svelte";
  import {
    type CkBTCBTCWithdrawalAccount,
    ckBTCWithdrawalAccountsStore,
  } from "$lib/stores/ckbtc-withdrawal-accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import { Spinner, IconClock, IconCheck } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import { toastsError } from "$lib/stores/toasts.store";
  import { emit } from "$lib/utils/events.utils";
  import type { CkBTCWalletModal } from "$lib/types/ckbtc-accounts.modal";
  import type { Account } from "$lib/types/account";

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

    await loadCkBTCWithdrawalAccount({
      universeId: $selectedCkBTCUniverseIdStore,
    });
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
    (isNullish(account.balanceE8s) || isNullish(account.identifier));

  let accountBalance: bigint;
  $: accountBalance = account?.balanceE8s ?? 0n;

  let detailedAccountBalance: string;
  $: detailedAccountBalance = formatToken({
    value: accountBalance,
    detailed: true,
  });

  let transfersToBeCompleted: boolean | undefined;
  $: account,
    loading,
    (() => {
      transfersToBeCompleted =
        loading || isNullish(account) ? undefined : accountBalance > 0n;
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

  const openSend = () => {
    const canisters = nonNullish($selectedCkBTCUniverseIdStore)
      ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
      : undefined;

    if (isNullish($selectedCkBTCUniverseIdStore) || isNullish(canisters)) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_no_universe",
      });
      return;
    }

    emit<CkBTCWalletModal>({
      message: "nnsCkBTCAccountsModal",
      detail: {
        type: "ckbtc-transaction",
        data: {
          // CkBTCBTCWithdrawalAccount is a partial type of Account. When action button is enable it contains similar information as Account.
          account: account as Account,
          reloadAccountFromStore: undefined,
          universeId: $selectedCkBTCUniverseIdStore,
          canisters,
          loadTransactions: false,
        },
      },
    });
  };
</script>

{#if visibility !== "hidden" && nonNullish(account)}
  <button
    class="card"
    class:complete={transfersToBeCompleted}
    class:ok={transfersToBeCompleted === false}
    class:fade={visibility === "fade"}
    data-tid="open-restart-convert-ckbtc-to-btc"
    disabled={transfersToBeCompleted !== true}
    on:click={openSend}
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

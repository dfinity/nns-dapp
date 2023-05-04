<script lang="ts">
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { loadCkBTCWithdrawalAccount } from "$lib/services/ckbtc-withdrawal-accounts.services";
  import { onMount } from "svelte";
  import {
    type CkBTCBTCWithdrawalAccount,
    ckBTCWithdrawalAccountsStore,
  } from "$lib/stores/ckbtc-withdrawal-accounts.store";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { ICPToken, TokenAmount } from "@dfinity/nns";

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
</script>

{#if nonNullish(account)}
  <button
    class="card"
    data-tid="open-restart-convert-ckbtc-to-btc"
    disabled={isNullish(account.balance) || isNullish(account.identifier)}
  >
    {#if loading}
      Loading redeeming account...
    {:else}
      Redeeming account <AmountDisplay singleLine amount={accountBalance} />
    {/if}
  </button>
{/if}

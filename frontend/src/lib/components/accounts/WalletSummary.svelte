<script lang="ts">
  import { TokenAmount, type Token } from "@dfinity/utils";
  import { accountName as getAccountName } from "$lib/utils/accounts.utils";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import { getContext } from "svelte";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import { formatToken } from "$lib/utils/token.utils";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { KeyValuePair } from "@dfinity/gix-components";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import { onIntersection } from "$lib/directives/intersection.directives";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import { nonNullish } from "@dfinity/utils";

  export let detailedBalance = false;
  export let token: Token | undefined;

  const { store } = getContext<WalletContext>(WALLET_CONTEXT_KEY);

  let accountName: string;
  $: accountName = getAccountName({
    account: $store.account,
    mainName: $i18n.accounts.main,
  });

  let accountBalance: bigint;
  $: accountBalance = $store.account?.balanceE8s ?? 0n;

  let accountBalanceToken: TokenAmount | undefined;
  $: accountBalanceToken = nonNullish(token)
    ? (TokenAmount.fromE8s({
        amount: accountBalance,
        token,
      }) as TokenAmount)
    : undefined;

  let detailedAccountBalance: string;
  $: detailedAccountBalance = formatToken({
    value: accountBalance,
    detailed: true,
  });

  let tokenSymbol: string;
  $: tokenSymbol = token?.symbol ?? "";

  const updateLayoutTitle = ($event: Event) => {
    const {
      detail: { intersecting },
    } = $event as unknown as CustomEvent<IntersectingDetail>;

    layoutTitleStore.set(
      intersecting
        ? $i18n.wallet.title
        : `${accountName} – ${formatToken({
            value: accountBalance,
          })} ${tokenSymbol}`
    );
  };
</script>

<div class="content-cell-details">
  <KeyValuePair>
    <h3
      slot="key"
      data-tid="wallet-summary"
      use:onIntersection
      on:nnsIntersecting={updateLayoutTitle}
    >
      {accountName}
    </h3>
    <svelte:fragment slot="value">
      {#if nonNullish(accountBalanceToken)}
        <Tooltip
          id="wallet-detailed-icp"
          text={replacePlaceholders($i18n.accounts.current_balance_detail, {
            $amount: detailedAccountBalance,
            $token: tokenSymbol,
          })}
        >
          <AmountDisplay
            copy
            amount={accountBalanceToken}
            inline
            detailed={detailedBalance}
          />
        </Tooltip>
      {/if}
    </svelte:fragment>
  </KeyValuePair>

  <KeyValuePair>
    <p slot="key" class="label">{$i18n.wallet.address}</p>
    <p slot="value" class="value">
      <IdentifierHash identifier={$store.account?.identifier ?? ""} />
    </p>
  </KeyValuePair>

  {#if isAccountHardwareWallet($store.account)}
    <KeyValuePair>
      <p slot="key" class="label">{$i18n.wallet.principal}</p>
      <p slot="value" class="value">
        <IdentifierHash
          identifier={$store.account?.principal?.toString() ?? ""}
        />
      </p>
    </KeyValuePair>
  {/if}
</div>

<style lang="scss">
  p {
    margin: 0;
  }

  div {
    --token-font-size: var(--font-size-h3);
  }
</style>

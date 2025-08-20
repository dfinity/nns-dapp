<script lang="ts">
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { KeyValuePair } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish, TokenAmountV2, type Token } from "@dfinity/utils";

  export let rootCanisterId: Principal;
  export let canSelectSource: boolean;
  export let selectedAccount: Account | undefined = undefined;
  export let token: Token | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;
</script>

<div class="select-account" data-tid="transaction-from-account">
  <!-- TODO(yhabib): Remove once we have new designs for the Topup Canister modal. By default, it behaves as it used to behave. Consumers have to opt-in. -->
  {#if nonNullish(token)}
    <KeyValuePair>
      {#snippet key()}
        {#if canSelectSource}
          <span class="label">{$i18n.accounts.source}</span>
        {:else}
          <span class="label account-name"
            >{$i18n.accounts.source}: {selectedAccount?.name ??
              $i18n.accounts.main}</span
          >
        {/if}
      {/snippet}

      <!-- svelte:fragment needed to avoid warnings -->
      <!-- Svelte issue: https://github.com/sveltejs/svelte/issues/5604 -->
      {#snippet value()}
        {#if nonNullish(selectedAccount)}
          <AmountDisplay
            singleLine
            amount={TokenAmountV2.fromUlps({
              amount: selectedAccount.balanceUlps,
              token,
            })}
          />
        {/if}
      {/snippet}
    </KeyValuePair>
  {:else if canSelectSource}
    <span class="label">{$i18n.accounts.source}</span>
  {:else}
    <span class="label account-name"
      >{$i18n.accounts.source}: {selectedAccount?.name ??
        $i18n.accounts.main}</span
    >
  {/if}
  {#if canSelectSource}
    <SelectAccountDropdown
      {rootCanisterId}
      bind:selectedAccount
      {filterAccounts}
    />
  {:else}
    <p class="account-identifier">
      {selectedAccount?.identifier}
    </p>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .select-account {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  p {
    margin: 0;
  }

  .account-identifier {
    word-break: break-all;
  }

  .label {
    @include fonts.small();
    color: var(--text-description);
  }

  .account-name {
    word-break: break-all;
    @include text.clamp(2);
  }
</style>

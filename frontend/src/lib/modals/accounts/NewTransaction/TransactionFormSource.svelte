<script lang="ts">
  import { KeyValuePair } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { Account } from "$lib/types/account";
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import type { Principal } from "@dfinity/principal";

  export let rootCanisterId: Principal;
  export let canSelectSource: boolean;
  export let selectedAccount: Account | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;
</script>

<div class="select-account">
  <KeyValuePair>
    <span slot="key" class="label">{$i18n.accounts.source}</span>
    <div slot="value">
      {#if selectedAccount !== undefined}
        <AmountDisplay singleLine amount={selectedAccount?.balance} />
      {/if}
    </div>
  </KeyValuePair>

  {#if canSelectSource}
    <SelectAccountDropdown
      {rootCanisterId}
      bind:selectedAccount
      {filterAccounts}
    />
  {:else}
    <div class="given-source">
      <p>
        {selectedAccount?.name ?? $i18n.accounts.main}
      </p>
      <p class="account-identifier">
        {selectedAccount?.identifier}
      </p>
    </div>
  {/if}
</div>

<style lang="scss">
  .select-account {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .given-source {
    p {
      margin: 0;
    }
  }
</style>

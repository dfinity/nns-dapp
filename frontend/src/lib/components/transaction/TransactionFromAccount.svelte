<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";

  export let rootCanisterId: Principal;
  export let canSelectSource: boolean;
  export let selectedAccount: Account | undefined = undefined;
</script>

<div class="select-account" data-tid="transaction-from-account">
  <KeyValuePair>
    <span slot="key" class="label">{$i18n.accounts.source}</span>
    <!-- svelte:fragment needed to avoid warnings -->
    <!-- Svelte issue: https://github.com/sveltejs/svelte/issues/5604 -->
    <svelte:fragment slot="value">
      {#if selectedAccount !== undefined}
        <AmountDisplay singleLine amount={selectedAccount?.balance} />
      {/if}
    </svelte:fragment>
  </KeyValuePair>

  {#if canSelectSource}
    <SelectAccountDropdown {rootCanisterId} bind:selectedAccount />
  {:else}
    <p>
      {selectedAccount?.name ?? $i18n.accounts.main}
    </p>
    <p class="account-identifier">
      {selectedAccount?.identifier}
    </p>
  {/if}
</div>

<style lang="scss">
  .select-account {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  p {
    margin: 0;
  }

  .account-identifier {
    word-break: break-all;
  }
</style>

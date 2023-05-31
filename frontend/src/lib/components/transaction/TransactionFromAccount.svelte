<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import type { Token } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/nns";

  export let rootCanisterId: Principal;
  export let canSelectSource: boolean;
  export let selectedAccount: Account | undefined = undefined;
  // TODO: use token when selectedAccount?.balance will be replaced with E8s value.
  // svelte-ignore unused-export-let
  export let token: Token = ICPToken;
</script>

<div class="select-account" data-tid="transaction-from-account">
  <KeyValuePair>
    <svelte:fragment slot="key">
      {#if canSelectSource}
        <span class="label">{$i18n.accounts.source}</span>
      {:else}
        <span class="label account-name"
          >{$i18n.accounts.source}: {selectedAccount?.name ??
            $i18n.accounts.main}</span
        >
      {/if}
    </svelte:fragment>

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
    <p class="account-identifier">
      {selectedAccount?.identifier}
    </p>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";

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

  .account-name {
    word-break: break-all;
    @include text.clamp(2);
  }
</style>

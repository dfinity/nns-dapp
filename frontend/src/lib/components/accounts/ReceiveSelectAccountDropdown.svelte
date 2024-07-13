<script lang="ts">
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { nonNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let account: Account | undefined;
  export let universeId: UniverseCanisterId | undefined = undefined;
  export let canSelectAccount: boolean;

  let selectedAccount = account;

  const dispatcher = createEventDispatcher();
  $: selectedAccount,
    (() => dispatcher("nnsSelectedAccount", selectedAccount))();
</script>

{#if canSelectAccount && nonNullish(universeId)}
  <div class="source">
    <span class="label">{$i18n.accounts.receive_account}</span>

    <SelectAccountDropdown rootCanisterId={universeId} bind:selectedAccount />
  </div>
{/if}

<style lang="scss">
  .source {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    padding: 0 0 var(--padding-2x);
  }
</style>

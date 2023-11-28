<script lang="ts">
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { selectedIcrcTokenUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { i18n } from "$lib/stores/i18n";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { Account } from "$lib/types/account";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { isNullish, nonNullish } from "@dfinity/utils";

  let loading: boolean;
  $: loading =
    isNullish($selectedIcrcTokenUniverseIdStore) ||
    isNullish($icrcAccountsStore[$selectedIcrcTokenUniverseIdStore.toText()]);

  let accounts: Account[] = [];
  $: accounts = nonNullish($selectedIcrcTokenUniverseIdStore)
    ? $icrcAccountsStore[$selectedIcrcTokenUniverseIdStore.toText()]
        ?.accounts ?? []
    : [];

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish($selectedIcrcTokenUniverseIdStore)
    ? $tokensStore[$selectedIcrcTokenUniverseIdStore.toText()]?.token
    : undefined;
</script>

<div class="card-grid" data-tid="icrc-token-accounts-component">
  {#if loading}
    <SkeletonCard size="medium" />
  {:else}
    {#each accounts as account}
      <AccountCard {account} {token}
        >{account.name ?? $i18n.accounts.main}</AccountCard
      >
    {/each}
  {/if}
</div>

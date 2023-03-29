<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import {
    getAccountByRootCanister,
    getAccountsByRootCanister,
  } from "$lib/utils/accounts.utils";
  import { Dropdown, DropdownItem, Spinner } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
  import { isNullish } from "@dfinity/utils";

  export let selectedAccount: Account | undefined = undefined;
  export let rootCanisterId: Principal;
  export let filterAccounts: (account: Account) => boolean = () => true;

  // In case the component is already initialized with a selectedAccount
  // To avoid cyclical dependencies, we don't update this if `selectedAccount` changes
  let selectedAccountIdentifier: string | undefined =
    selectedAccount?.identifier;

  $: selectedAccount = getAccountByRootCanister({
    identifier: selectedAccountIdentifier,
    rootCanisterId,
    universesAccounts: $universesAccountsStore,
  });

  let selectableAccounts: Account[] = [];
  $: selectableAccounts =
    getAccountsByRootCanister({
      rootCanisterId,
      universesAccounts: $universesAccountsStore,
    })?.filter(filterAccounts) ?? [];

  $: selectableAccounts,
    (() => {
      if (isNullish(selectedAccountIdentifier)) {
        return;
      }

      // If the list of selectable accounts has change and the selected account is not part of this updated list.
      // Then the selected account must be reset to the first of the selectable accounts, the first of the dropdown.
      if (
        selectableAccounts.find(
          ({ identifier }) => identifier === selectedAccountIdentifier
        ) === undefined
      ) {
        selectedAccountIdentifier = selectableAccounts[0]?.identifier;
      }
    })();
</script>

{#if selectableAccounts.length === 0}
  <div class="select">
    <Spinner size="small" inline />
  </div>
{:else}
  <Dropdown
    name="account"
    bind:selectedValue={selectedAccountIdentifier}
    testId="select-account-dropdown"
  >
    {#each selectableAccounts as { identifier, name } (identifier)}
      <DropdownItem value={identifier}>
        {name ?? $i18n.accounts.main}
      </DropdownItem>
    {/each}
  </Dropdown>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/form";
  .select {
    @include form.input;

    position: relative;
    box-sizing: border-box;

    padding: var(--padding-2x);
    border-radius: var(--border-radius);

    width: var(--dropdown-width, auto);
  }
</style>

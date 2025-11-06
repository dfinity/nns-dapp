<script lang="ts">
  import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { addressBookStore } from "$lib/stores/address-book.store";
  import { i18n } from "$lib/stores/i18n";
  import { getAddressString } from "$lib/utils/address-book.utils";
  import { Dropdown, DropdownItem, Spinner } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  interface Props {
    selectedAddress: string | undefined;
    filterAddresses?: (address: NamedAddress) => boolean;
  }

  let { selectedAddress = $bindable(), filterAddresses = () => true }: Props =
    $props();

  // Derive applicable addresses
  const applicableAddresses = $derived(
    $addressBookStore.namedAddresses?.filter(filterAddresses) ?? []
  );

  // Check if still loading
  const isLoading = $derived($addressBookStore.namedAddresses === undefined);

  // Internal state for the dropdown - sync with selectedAddress
  let selectedNickname = $state<string | undefined>(undefined);

  // When selectedAddress changes from outside, find matching nickname
  $effect(() => {
    if (nonNullish(selectedAddress)) {
      const matchingEntry = applicableAddresses.find(
        (entry) => getAddressString(entry.address) === selectedAddress
      );
      selectedNickname = matchingEntry?.name;
    } else {
      selectedNickname = undefined;
    }
  });

  // When selectedNickname changes (user selects from dropdown), update selectedAddress
  $effect(() => {
    if (nonNullish(selectedNickname)) {
      const matchingEntry = applicableAddresses.find(
        (addr) => addr.name === selectedNickname
      );
      if (matchingEntry)
        selectedAddress = getAddressString(matchingEntry.address);
    } else {
      selectedAddress = undefined;
    }
  });
</script>

<div data-tid="address-book-select">
  {#if isLoading}
    <div class="select">
      <Spinner size="small" inline />
    </div>
  {:else if applicableAddresses.length === 0}
    <div class="select empty">
      <span class="placeholder"
        >{$i18n.address_book.select_address_placeholder}</span
      >
    </div>
  {:else}
    <Dropdown
      name="address-book"
      bind:selectedValue={selectedNickname}
      testId="address-book-dropdown"
    >
      {#each applicableAddresses as { name } (name)}
        <DropdownItem value={name}>{name}</DropdownItem>
      {/each}
    </Dropdown>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/form";

  .select {
    @include form.input;

    position: relative;
    box-sizing: border-box;

    padding: var(--padding-2x);
    border-radius: var(--border-radius);

    width: var(--dropdown-width, auto);

    &.empty {
      color: var(--text-description);
    }
  }

  .placeholder {
    color: var(--text-description);
  }
</style>

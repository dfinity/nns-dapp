<script lang="ts">
  import { addressBookStore } from "$lib/stores/address-book.store";
  import { AddressBookFilter } from "$lib/types/address-book";
  import { i18n } from "$lib/stores/i18n";
  import {
    getAddressString,
    isIcrc1Address,
  } from "$lib/utils/address-book.utils";
  import { Dropdown, DropdownItem } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  interface Props {
    selectedAddress: string | undefined;
    filter?: AddressBookFilter;
  }

  let { selectedAddress = $bindable(), filter = AddressBookFilter.All }: Props =
    $props();

  // Derive applicable addresses based on filter
  const applicableAddresses = $derived.by(() => {
    const addresses = $addressBookStore.namedAddresses ?? [];
    if (filter === AddressBookFilter.ICRC1) {
      return addresses.filter((namedAddress) =>
        isIcrc1Address(namedAddress.address)
      );
    }
    return addresses;
  });

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
      selectedAddress = matchingEntry
        ? getAddressString(matchingEntry.address)
        : undefined;
    } else {
      selectedAddress = undefined;
    }
  });
</script>

<div data-tid="address-book-select">
  {#if applicableAddresses.length === 0}
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
    width: var(--dropdown-width, auto);
    border-radius: var(--border-radius);
    padding: var(--padding-2x);
    box-sizing: border-box;
    position: relative;

    &.empty {
      color: var(--text-description);
    }
  }

  .placeholder {
    color: var(--text-description);
  }
</style>

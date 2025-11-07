<script lang="ts">
  import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
  import AddressBookSelect from "$lib/components/transaction/AddressBookSelect.svelte";
  import TransactionFormFee from "$lib/components/transaction/TransactionFormFee.svelte";
  import TransactionFormItemNetwork from "$lib/components/transaction/TransactionFormItemNetwork.svelte";
  import TransactionFromAccount from "$lib/components/transaction/TransactionFromAccount.svelte";
  import TransactionMemo from "$lib/components/transaction/TransactionMemo.svelte";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { addressBookStore } from "$lib/stores/address-book.store";
  import { ENABLE_ADDRESS_BOOK } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { NotEnoughAmountError } from "$lib/types/common.errors";
  import { InvalidAmountError } from "$lib/types/neurons.errors";
  import {
    TransactionNetwork,
    type TransactionSelectDestinationMethods,
    type ValidateAmountFn,
  } from "$lib/types/transaction";
  import {
    assertEnoughAccountFunds,
    invalidAddress,
    isAccountHardwareWallet,
  } from "$lib/utils/accounts.utils";
  import { filterAddressesByToken } from "$lib/utils/address-book.utils";
  import { translate } from "$lib/utils/i18n.utils";
  import { validateTransactionMemo } from "$lib/utils/icp-transactions.utils";
  import {
    getMaxTransactionAmount,
    toTokenAmountV2,
  } from "$lib/utils/token.utils";
  import { Toggle, Tooltip } from "@dfinity/gix-components";
  import type { Principal } from "@icp-sdk/core/principal";
  import {
    isNullish,
    nonNullish,
    TokenAmount,
    TokenAmountV2,
    type Token,
  } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";
  import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";

  // Tested in the TransactionModal
  export let rootCanisterId: Principal;
  export let selectedAccount: Account | undefined = undefined;
  export let canSelectDestination: boolean;
  export let canSelectSource: boolean;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let amount: number | undefined = undefined;
  export let disableContinue = false;
  export let token: Token;
  export let transactionFee: TokenAmountV2 | TokenAmount;
  // TODO: Handle min and max validations inline: https://dfinity.atlassian.net/browse/L2-798
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets = false;
  export let showManualAddress = true;
  export let selectDestinationMethods: TransactionSelectDestinationMethods =
    "all";
  export let showLedgerFee = true;

  export let mustSelectNetwork = false;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let networkReadonly: boolean | undefined = undefined;

  export let validateAmount: ValidateAmountFn = () => undefined;
  export let withMemo: boolean = false;
  export let memo: string | undefined = undefined;

  let filterSourceAccounts: (account: Account) => boolean;
  $: filterSourceAccounts = (account: Account) => {
    return !skipHardwareWallets || !isAccountHardwareWallet(account);
  };

  let filterDestinationAccounts: (account: Account) => boolean;
  $: filterDestinationAccounts = (account: Account) => {
    return account.identifier !== selectedAccount?.identifier;
  };

  let max = 0;
  $: max = getMaxTransactionAmount({
    balance: selectedAccount?.balanceUlps,
    fee: toTokenAmountV2(transactionFee).toUlps(),
    maxAmount,
    token,
  });
  const addMax = () => (amount = max);

  let disableButton: boolean;
  $: disableButton =
    disableContinue ||
    selectedAccount === undefined ||
    amount === 0 ||
    amount === undefined ||
    invalidAddress({
      address: selectedDestinationAddress,
      network: selectedNetwork,
      rootCanisterId,
    }) ||
    errorMessage !== undefined ||
    memoErrorMessage !== undefined ||
    (mustSelectNetwork && isNullish(selectedNetwork));

  let errorMessage: string | undefined = undefined;
  $: (() => {
    // Remove error message when resetting amount or source account
    if (amount === undefined || selectedAccount === undefined) {
      errorMessage = undefined;
      return;
    }
    try {
      const tokens = TokenAmountV2.fromNumber({ amount, token });
      assertEnoughAccountFunds({
        account: selectedAccount,
        amountUlps: tokens.toUlps() + toTokenAmountV2(transactionFee).toUlps(),
      });
      errorMessage = validateAmount({ amount, selectedAccount });
    } catch (error: unknown) {
      if (error instanceof NotEnoughAmountError) {
        errorMessage = $i18n.error.insufficient_funds;
        return;
      }
      if (error instanceof InvalidAmountError) {
        errorMessage = $i18n.error.amount_not_valid;
        return;
      }
      if (error instanceof Error) {
        errorMessage = translate({ labelKey: error.message });
      }
    }
  })();

  let memoErrorMessage: string | undefined = undefined;
  $: (() => {
    if (!withMemo) {
      memo = undefined;
      memoErrorMessage = undefined;
      return;
    }

    if (isNullish(memo) || memo === "") {
      memoErrorMessage = undefined;
      return;
    }

    if (
      withMemo &&
      nonNullish(memo) &&
      nonNullish(selectedDestinationAddress)
    ) {
      const memoError = validateTransactionMemo({
        memo,
        destinationAddress: selectedDestinationAddress,
      });

      if (isNullish(memoError)) {
        memoErrorMessage = undefined;
        return;
      }

      memoErrorMessage = translate({
        labelKey:
          memoError === "ICP_MEMO_ERROR"
            ? "error.transaction_invalid_memo_icp"
            : "error.transaction_invalid_memo_icrc",
      });
    }
  })();

  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };

  const goNext = () => {
    dispatcher("nnsNext");
  };

  let balance: bigint | undefined;
  $: balance = selectedAccount?.balanceUlps;

  // Address book integration
  let applicableAddresses: NamedAddress[] = [];
  $: if ($ENABLE_ADDRESS_BOOK) {
    applicableAddresses = filterAddressesByToken({
      addresses: $addressBookStore.namedAddresses ?? [],
      token,
    });
  }

  // Determine which disabled message to show
  let addressBookDisabledTooltip: string;
  $: {
    const namedAddresses = $addressBookStore.namedAddresses;

    if (namedAddresses === undefined) {
      // Case 1: Still loading
      addressBookDisabledTooltip = $i18n.address_book.address_book_loading;
    } else if (namedAddresses.length === 0) {
      // Case 2: Loaded but empty
      addressBookDisabledTooltip = $i18n.address_book.address_book_empty;
    } else {
      // Case 3: Has addresses but none applicable for this token
      addressBookDisabledTooltip = $i18n.address_book.no_applicable_addresses;
    }
  }

  // Enable toggle by default only once when address book finishes loading with applicable addresses (if no destination address is already entered)
  let useAddressBook = false;
  let initializedAddressBook = false;
  $: if (
    $ENABLE_ADDRESS_BOOK &&
    applicableAddresses.length > 0 &&
    !initializedAddressBook
  ) {
    if (!selectedDestinationAddress) {
      useAddressBook = true;
    }
    initializedAddressBook = true;
  }

  const toggleAddressBook = () => {
    useAddressBook = !useAddressBook;
    // Reset address when toggling
    selectedDestinationAddress = undefined;
  };

  // When using address book with ckBTC (or other tokens requiring network selection),
  // automatically set network to ICP since address book only contains ICP/ICRC addresses
  let forceIcpNetwork = false;
  $: if ($ENABLE_ADDRESS_BOOK && useAddressBook && mustSelectNetwork) {
    selectedNetwork = TransactionNetwork.ICP;
    forceIcpNetwork = true;
  } else {
    forceIcpNetwork = false;
  }

  // TODO(GIX-1332): if destination address is selected, select corresponding network
  // TODO: if network changes, reset destination address or display error?
</script>

<form on:submit|preventDefault={goNext} data-tid="transaction-step-1">
  <TransactionFromAccount
    bind:selectedAccount
    {canSelectSource}
    {rootCanisterId}
    filterAccounts={filterSourceAccounts}
  />

  {#if canSelectDestination}
    {#if $ENABLE_ADDRESS_BOOK}
      <div class="destination-wrapper">
        <div class="destination-header">
          <p class="label">{$i18n.accounts.destination}</p>
          {#if applicableAddresses.length > 0}
            <div class="toggle-wrapper">
              <p>{$i18n.address_book.use_address_book}</p>
              <Toggle
                bind:checked={useAddressBook}
                on:nnsToggle={toggleAddressBook}
                ariaLabel={$i18n.address_book.use_address_book}
              />
            </div>
          {:else}
            <Tooltip
              id="address-book-toggle-disabled"
              text={addressBookDisabledTooltip}
            >
              <div class="toggle-wrapper">
                <p>{$i18n.address_book.use_address_book}</p>
                <Toggle
                  checked={false}
                  disabled={true}
                  ariaLabel={$i18n.address_book.use_address_book}
                />
              </div>
            </Tooltip>
          {/if}
        </div>
        {#if useAddressBook}
          <AddressBookSelect
            bind:selectedAddress={selectedDestinationAddress}
            filterAddresses={(address) =>
              applicableAddresses.some((addr) => addr.name === address.name)}
          />
        {:else}
          <SelectDestinationAddress
            {rootCanisterId}
            filterAccounts={filterDestinationAccounts}
            bind:selectedDestinationAddress
            bind:showManualAddress
            bind:selectMethods={selectDestinationMethods}
            {selectedNetwork}
            on:nnsOpenQRCodeReader
            hideTitle={true}
          />
          <div class="manual-address-info">
            <p class="warning"
              >{$i18n.address_book.manual_address_warning}
              <a href={AppPath.AddressBook} class="link">
                {$i18n.address_book.check_address_book_link}
              </a>
            </p>
          </div>
        {/if}
      </div>
    {:else}
      <SelectDestinationAddress
        {rootCanisterId}
        filterAccounts={filterDestinationAccounts}
        bind:selectedDestinationAddress
        bind:showManualAddress
        bind:selectMethods={selectDestinationMethods}
        {selectedNetwork}
        on:nnsOpenQRCodeReader
      />
    {/if}
  {/if}

  {#if mustSelectNetwork}
    <TransactionFormItemNetwork
      bind:selectedNetwork
      universeId={rootCanisterId}
      {selectedDestinationAddress}
      networkReadonly={networkReadonly || forceIcpNetwork}
    />
  {/if}

  <div class="amount">
    <AmountInput
      bind:amount
      on:nnsMax={addMax}
      {max}
      {errorMessage}
      {token}
      {balance}
    />

    {#if showLedgerFee}
      <TransactionFormFee {transactionFee} />
    {/if}

    <slot name="additional-info" />
    {#if withMemo}
      <TransactionMemo bind:memo errorMessage={memoErrorMessage} />
    {/if}
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      data-tid="transaction-button-cancel"
      type="button"
      on:click={close}>{$i18n.core.cancel}</button
    >
    <button
      class="primary"
      data-tid="transaction-button-next"
      disabled={disableButton}
      type="submit">{$i18n.core.continue}</button
    >
  </div>
</form>

<style lang="scss">
  form {
    --dropdown-width: 100%;
    gap: var(--padding-2x);
  }

  .amount {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    margin-top: var(--padding);
    --input-error-wrapper-padding: 0 0 var(--padding-2x);
  }

  .destination-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .destination-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 16px;

    .label {
      font-size: var(--font-size-small);
      color: var(--text-description);
    }

    .toggle-wrapper {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--padding);

      p {
        font-size: var(--font-size-small);
        color: var(--text-description);
      }
    }
  }

  .manual-address-info {
    display: flex;
    flex-direction: column;

    .warning {
      background-color: var(--warning-emphasis-light);
      padding: var(--padding) var(--padding-1_5x);
      border-radius: var(--border-radius);
      font-size: var(--font-size-small);
      margin-top: 0;
    }

    .link {
      font-size: var(--font-size-small);
      padding-top: var(--padding-0_5x);
      text-decoration: underline;
      display: inline-block;
      color: var(--primary);
      cursor: pointer;

      &:hover {
        text-decoration: none;
      }
    }
  }
</style>

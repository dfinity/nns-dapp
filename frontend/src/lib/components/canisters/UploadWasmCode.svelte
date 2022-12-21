<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { isNullish, nonNullish, valueSpan } from "$lib/utils/utils";
  import {
    INSTALL_WAPP_CONTEXT_KEY,
    type InstallWAppContext,
  } from "$lib/types/install-wapp.context";
  import { sha256 } from "$lib/utils/crypto.utils";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import type { Account } from "$lib/types/account";
  import TransactionFormSource from "$lib/modals/accounts/NewTransaction/TransactionFormSource.svelte";
  import { getIcpToCyclesExchangeRate } from "$lib/services/canisters.services";
  import {
    convertTCyclesToIcpNumber,
    formatToken,
    numberToE8s,
  } from "$lib/utils/token.utils";
  import { NEW_CANISTER_MIN_T_CYCLES } from "$lib/constants/canisters.constants";
  import { Html } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  const { store, next, selectFile }: InstallWAppContext =
    getContext<InstallWAppContext>(INSTALL_WAPP_CONTEXT_KEY);

  let validFile = false;
  let inputWasmName: string | undefined = undefined;

  let icpToCyclesExchangeRate: bigint | undefined;

  const initInstallWAppAmount = async () => {
    icpToCyclesExchangeRate = await getIcpToCyclesExchangeRate();

    if (icpToCyclesExchangeRate !== undefined) {
      const amount = Number(
        convertTCyclesToIcpNumber({
          tCycles: NEW_CANISTER_MIN_T_CYCLES,
          exchangeRate: icpToCyclesExchangeRate,
        }).toFixed(8)
      );

      store.update((values) => ({
        ...values,
        amount
      }));
    }
  }

  onMount(async () => {
    updateInputWasmInfo();

    await initInstallWAppAmount();
  });

  const updateInputWasmInfo = () => {
    validFile = $store.file !== undefined;
    inputWasmName = $store.file?.name ?? undefined;
  };

  $: $store, updateInputWasmInfo();

  const dispatcher = createEventDispatcher();

  let hashInput = $store.hash ?? "";
  let validHash = false;

  const verifyHash = async () => {
    if (isNullish($store.file)) {
      validHash = false;
      updateHashErrorMessage();
      return;
    }

    const sha = await sha256($store.file);
    validHash = hashInput !== "" && hashInput === sha;
    updateHashErrorMessage();
  };

  $: hashInput, $store.file, (async () => await verifyHash())();

  let hashErrorMessage: string | undefined = undefined;

  // Avoid flickering of the screen because computing hash is async
  const updateHashErrorMessage = () => {
    hashErrorMessage =
      !validHash && hashInput !== "" && nonNullish($store.file)
        ? $i18n.canisters.invalid_hash
        : undefined;
  };

  const updateHashStore = async () => {
    store.update((values) => ({
      ...values,
      hash: hashInput !== "" ? hashInput : undefined,
    }));
  };

  let validAccountBalance = false;
  $: validAccountBalance = $store.amount !== undefined && selectedAccount?.balance.toE8s() > numberToE8s($store.amount)

  let disableNext = true;
  $: disableNext = !validFile || !validHash || !validAccountBalance;

  let selectedAccount: Account | undefined;
  const filterAccounts = (account: Account) => !isAccountHardwareWallet(account);

  const onSelectAccount = (account: Account | undefined) =>
    store.update((values) => ({
      ...values,
      account,
    }));

  $: onSelectAccount(selectedAccount);
</script>

<form on:submit|preventDefault={next}>
  <div class="upload">
    <p>{$i18n.canisters.upload_from_device}</p>
    <button
      class="primary full-width input-wasm"
      role="button"
      on:click|preventDefault={selectFile}
      >{inputWasmName !== undefined
        ? `${inputWasmName}`
        : $i18n.canisters.select_file}</button
    >
  </div>

  <div>
    <InputWithError
      inputType="text"
      placeholderLabelKey="canisters.matching_hash_placeholder"
      name="hash"
      bind:value={hashInput}
      errorMessage={hashErrorMessage}
      on:blur={updateHashStore}
    >
      <svelte:fragment slot="label"
        >{$i18n.canisters.verify_hash}</svelte:fragment
      >
    </InputWithError>
  </div>

  <div>
    <TransactionFormSource
      rootCanisterId={OWN_CANISTER_ID}
      {filterAccounts}
      bind:selectedAccount
      canSelectSource={true}
    />
  </div>

  <p class="description">
    {#if $store.amount !== undefined}
      <Html
        text={replacePlaceholders($i18n.canisters.install_wapp_fee, {
          $amount: valueSpan(
            formatToken({
              value: numberToE8s($store.amount),
            })
          ),
        })}
      />
    {/if}

    {#if !validAccountBalance}
      <span class="error">{$i18n.error__canister.not_enough_fund}</span>
    {/if}
  </p>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      on:click={() => dispatcher("nnsClose")}
    >
      {$i18n.core.cancel}
    </button>

    <button type="submit" class="primary" disabled={disableNext}>
      {$i18n.core.next}
    </button>
  </div>
</form>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/text";

  p,
  form {
    z-index: calc(var(--z-index) + 1);
  }

  .label {
    margin-bottom: var(--padding-4x);
  }

  .upload {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--padding-0_5x);
    margin-bottom: calc(var(--padding) * 3 / 4);

    p {
      margin-top: 0;
    }
  }

  .input-wasm {
    @include text.truncate;
  }

  .error {
    color: var(--negative-emphasis);
  }
</style>

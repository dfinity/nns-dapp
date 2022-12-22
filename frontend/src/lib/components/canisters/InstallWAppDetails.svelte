<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import {
    INSTALL_WAPP_CONTEXT_KEY,
    type InstallWAppContext,
  } from "$lib/types/install-wapp.context";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import type { Account } from "$lib/types/account";
  import TransactionFormSource from "$lib/modals/accounts/NewTransaction/TransactionFormSource.svelte";
  import { getIcpToCyclesExchangeRate } from "$lib/services/canisters.services";
  import {
    convertTCyclesToIcpNumber,
    numberToE8s,
  } from "$lib/utils/token.utils";
  import { NEW_CANISTER_MIN_T_CYCLES } from "$lib/constants/canisters.constants";
  import InstallWAppAmount from "$lib/components/canisters/InstallWAppAmount.svelte";

  const { store, next, selectFile }: InstallWAppContext =
    getContext<InstallWAppContext>(INSTALL_WAPP_CONTEXT_KEY);

  let inputFileName: string | undefined = undefined;

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
        amount,
      }));
    }
  };

  onMount(async () => {
    updateInputFileName();

    await initInstallWAppAmount();
  });

  const updateInputFileName = () =>
    (inputFileName = $store.file?.name ?? undefined);

  $: $store, updateInputFileName();

  const dispatcher = createEventDispatcher();

  let validAccountBalance = false;
  $: validAccountBalance =
    $store.amount !== undefined &&
    selectedAccount?.balance.toE8s() > numberToE8s($store.amount);

  let disableNext = true;
  $: disableNext = $store.file === undefined || !validAccountBalance;

  let selectedAccount: Account | undefined;
  const filterAccounts = (account: Account) =>
    !isAccountHardwareWallet(account);

  const onSelectAccount = (account: Account | undefined) =>
    store.update((values) => ({
      ...values,
      account,
    }));

  $: onSelectAccount(selectedAccount);
</script>

<form on:submit|preventDefault={next}>
  <div>
    <TransactionFormSource
      rootCanisterId={OWN_CANISTER_ID}
      {filterAccounts}
      bind:selectedAccount
      canSelectSource={true}
    />
  </div>

  <p class="description">
    <InstallWAppAmount />

    {#if selectedAccount !== undefined && !validAccountBalance}
      <span class="error">{$i18n.error__canister.not_enough_fund}</span>
    {/if}
  </p>

  <div class="upload">
    <p>{$i18n.canisters.upload_from_device}</p>
    <button
      class="primary full-width input-wasm"
      role="button"
      on:click|preventDefault={selectFile}
      >{inputFileName !== undefined
        ? `${inputFileName}`
        : $i18n.canisters.select_file}</button
    >
  </div>

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

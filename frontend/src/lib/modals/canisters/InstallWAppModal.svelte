<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { WizardStep, WizardSteps } from "@dfinity/gix-components";
  import { WizardModal } from "@dfinity/gix-components";
  import { writable } from "svelte/store";
  import type {
    InstallWAppContext,
    InstallWAppStore,
  } from "$lib/types/install-wapp.context";
  import { onMount, setContext } from "svelte";
  import { INSTALL_WAPP_CONTEXT_KEY } from "$lib/types/install-wapp.context";
  import UploadWasmCode from "$lib/components/canisters/UploadWasmCode.svelte";
  import ReviewInstallWApp from "$lib/components/canisters/ReviewInstallWApp.svelte";
  import SelectAccount from "$lib/components/accounts/SelectAccount.svelte";
  import type { Account } from "$lib/types/account";
  import SelectCyclesCreateCanister from "$lib/components/canisters/SelectCyclesCreateCanister.svelte";
  import { getIcpToCyclesExchangeRate } from "$lib/services/canisters.services";

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;
  let icpToCyclesExchangeRate: bigint | undefined;
  let amount: number | undefined;

  onMount(
    async () => (icpToCyclesExchangeRate = await getIcpToCyclesExchangeRate())
  );

  const steps: WizardSteps = [
    {
      name: "Enter",
      title: $i18n.canisters.install_code_title,
    },
    {
      name: "SelectAccount",
      title: $i18n.accounts.select_source,
    },
    {
      name: "SelectCycles",
      title: $i18n.canisters.enter_amount,
    },
    {
      name: "Confirm",
      title: $i18n.canisters.review_install_code,
    },
  ];

  let inputWasm: HTMLInputElement | undefined;

  const store = writable<InstallWAppStore>({});

  setContext<InstallWAppContext>(INSTALL_WAPP_CONTEXT_KEY, {
    store,
    next: () => modal?.next(),
    back: () => modal?.back(),
    selectFile: () => inputWasm?.click(),
  });

  const onInputChange = () =>
    store.update((values) => ({
      ...values,
      file: inputWasm?.files?.[0],
    }));

  const onSelectAccount = ({
    detail: { selectedAccount },
  }: CustomEvent<{ selectedAccount: Account }>) => {
    store.update((values) => ({
      ...values,
      account: selectedAccount,
    }));

    modal.next();
  };

  const onSelectAmount = () => {
    store.update((values) => ({
      ...values,
      amount,
    }));

    modal.next();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <span slot="title"
    >{currentStep?.title ?? $i18n.canisters.install_code_title}</span
  >

  <!-- Maintain in memory the input file for any steps -->
  <input
    bind:this={inputWasm}
    type="file"
    multiple={false}
    accept="application/wasm"
    on:change={onInputChange}
  />

  {#if currentStep?.name === steps[0].name}
    <UploadWasmCode on:nnsClose />
  {/if}

  {#if currentStep?.name === steps[1].name}
    <SelectAccount
      hideHardwareWalletAccounts
      on:nnsSelectAccount={onSelectAccount}
    />
  {/if}

  {#if currentStep?.name === steps[2].name}
    <SelectCyclesCreateCanister
      {icpToCyclesExchangeRate}
      bind:amount
      on:nnsClose
      on:nnsBack={modal.back}
      on:nnsSelectAmount={onSelectAmount}
    />
  {/if}

  {#if currentStep?.name === steps[3].name}
    <ReviewInstallWApp on:nnsClose />
  {/if}
</WizardModal>

<style lang="scss">
  input {
    visibility: hidden;
    opacity: 0;
    position: absolute;
  }
</style>

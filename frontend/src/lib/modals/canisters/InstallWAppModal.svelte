<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { WizardStep, WizardSteps } from "@dfinity/gix-components";
  import { WizardModal } from "@dfinity/gix-components";
  import { writable } from "svelte/store";
  import type {
    InstallWAppContext,
    InstallWAppStore,
  } from "$lib/types/install-wapp.context";
  import { setContext } from "svelte";
  import { INSTALL_WAPP_CONTEXT_KEY } from "$lib/types/install-wapp.context";
  import UploadWasmCode from "$lib/components/canisters/UploadWasmCode.svelte";
  import ReviewInstallWApp from "$lib/components/canisters/ReviewInstallWApp.svelte";

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

  const steps: WizardSteps = [
    {
      name: "Enter",
      title: $i18n.canisters.install_code_title,
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

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import type { WizardStep, WizardSteps } from "@dfinity/gix-components";
  import { WizardModal } from "@dfinity/gix-components";
  import { writable } from "svelte/store";
  import type {
    InstallCodeContext,
    InstallCodeStore,
  } from "$lib/types/install-code.context";
  import { setContext } from "svelte";
  import { INSTALL_CODE_CONTEXT_KEY } from "$lib/types/install-code.context";
  import EnterWasmCode from "$lib/components/canisters/EnterWasmCode.svelte";
  import InstallWasmCode from "$lib/components/canisters/InstallWasmCode.svelte";

  export let canisterId: Principal;

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

  const store = writable<InstallCodeStore>({
    source: "url",
    canisterId,
    file: undefined,
    url: undefined,
  });

  setContext<InstallCodeContext>(INSTALL_CODE_CONTEXT_KEY, {
    store,
    next: () => modal?.next(),
    back: () => modal?.back(),
    selectFile: () => inputWasm?.click(),
    resetFile: () => {
      if (!inputWasm) {
        return;
      }

      inputWasm.value = "";
    },
  });

  const onInputChange = () =>
    store.update((values) => ({
      ...values,
      source: "file",
      url: undefined,
      file: inputWasm?.files?.[0],
    }));
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <span slot="title"
    >{currentStep?.title ?? $i18n.canisters.install_code_title}</span
  >

  <!-- Maintain an input file for any steps -->
  <input
    bind:this={inputWasm}
    type="file"
    multiple={false}
    accept="application/wasm"
    on:change={onInputChange}
  />

  {#if currentStep?.name === steps[0].name}
    <EnterWasmCode on:nnsClose />
  {/if}

  {#if currentStep?.name === steps[1].name}
    <InstallWasmCode on:nnsClose />
  {/if}
</WizardModal>

<style lang="scss">
  input {
    visibility: hidden;
    opacity: 0;
    position: absolute;
  }
</style>

<script lang="ts">
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import InputWasm from "$lib/components/canisters/InputWasm.svelte";

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

  const steps: WizardSteps = [
    {
      name: "Enter",
      title: $i18n.canisters.canister_wasm,
    },
    {
      name: "Confirm",
      title: $i18n.canisters.canister_wasm_confirm,
    },
  ];
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <span slot="title">{currentStep?.title ?? $i18n.canisters.canister_wasm}</span
  >

  {#if currentStep?.name === steps[0].name}
    <InputWasm on:nnsClose on:nnsNext={modal.next} />
  {/if}
</WizardModal>

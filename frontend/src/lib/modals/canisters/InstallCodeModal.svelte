<script lang="ts">
  import {
    Input,
    Toggle,
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { createEventDispatcher } from "svelte";

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

  const onToggle = () => {
    showUrlInput = !showUrlInput;
    urlInput = "";
    urlInputErrorMessage = undefined;
    updateInputWasmInfo();
  };

  export let showUrlInput = true;
  let urlInput = "";
  let urlInputErrorMessage: string | undefined = undefined;

  let inputWasm: HTMLInputElement | undefined;
  let inputWasmName: string | undefined = undefined;

  const checkUrl = () => {
    try {
      new URL(urlInput);
      urlInputErrorMessage = undefined;
    } catch (_) {
      urlInputErrorMessage = $i18n.error.invalid_url;
    }
  };

  let validUrl = false;
  $: validUrl = urlInputErrorMessage === undefined && urlInput.length > 0;

  let validFile = false;

  const updateInputWasmInfo = () => {
    validFile = inputWasm?.files?.length > 0;
    inputWasmName = inputWasm?.files?.[0]?.name;
    console.log(inputWasmName);
  };

  let disableNext = false;
  $: disableNext = (showUrlInput && !validUrl) || (!showUrlInput && !validFile);

  const dispatcher = createEventDispatcher();
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <span slot="title">{currentStep?.title ?? $i18n.canisters.canister_wasm}</span
  >

  {#if currentStep?.name === steps[0].name}
    <p class="label">{$i18n.canisters.reinstall_text}</p>

    <form on:submit|preventDefault={() => modal.next()}>
      <div class="toggle">
        <span>{$i18n.canisters.upload}</span>
        <Toggle
          bind:checked={showUrlInput}
          on:nnsToggle={onToggle}
          ariaLabel="change"
        />
        <span>{$i18n.canisters.url}</span>
      </div>

      {#if showUrlInput}
        <InputWithError
          inputType="text"
          placeholderLabelKey="canisters.url_placeholder"
          name="url"
          bind:value={urlInput}
          errorMessage={urlInputErrorMessage}
          on:blur={checkUrl}
        >
          <svelte:fragment slot="label"
            >{$i18n.canisters.enter_url}</svelte:fragment
          >
        </InputWithError>
      {:else}
        <input
          bind:this={inputWasm}
          type="file"
          multiple={false}
          accept="application/wasm"
          on:change={updateInputWasmInfo}
        />

        <div class="upload">
          <p>{$i18n.canisters.upload_from_device}</p>
          <button
            class="primary full-width input-wasm"
            role="button"
            on:click|preventDefault={() => inputWasm?.click()}
            >{inputWasmName !== undefined
              ? `${inputWasmName}`
              : $i18n.canisters.select_file}</button
          >
        </div>
      {/if}

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
  {/if}
</WizardModal>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/text";

  .label {
    margin-bottom: var(--padding-4x);
  }

  .toggle {
    display: flex;
    justify-content: flex-end;
    gap: var(--padding);
    z-index: calc(var(--z-index) + 1);
  }

  input {
    visibility: hidden;
    opacity: 0;
    position: absolute;
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
</style>

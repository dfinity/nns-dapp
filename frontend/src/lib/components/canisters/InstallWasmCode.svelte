<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from "svelte";
  import { Toggle } from "@dfinity/gix-components";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { validateUrl } from "$lib/utils/utils";
  import { installCode } from "$lib/services/canisters.services";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal;

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

  const checkUrl = () =>
    (urlInputErrorMessage = validateUrl(urlInput)
      ? undefined
      : $i18n.error.invalid_url);

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

  const onSubmit = async () => {
    startBusy({ initiator: "install-code" });

    const { success } = await installCode({
      source: showUrlInput ? "url" : "file",
      url: urlInput,
      file: inputWasm?.files?.[0],
      canisterId,
    });

    if (success) {
      dispatcher("nnsClose");
    }

    stopBusy("install-code");
  };
</script>

<p class="label">{$i18n.canisters.reinstall_text}</p>

<form on:submit|preventDefault={onSubmit}>
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
      <svelte:fragment slot="label">{$i18n.canisters.enter_url}</svelte:fragment
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
      {$i18n.canisters.execute}
    </button>
  </div>
</form>

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

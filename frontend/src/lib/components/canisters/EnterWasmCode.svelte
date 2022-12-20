<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import { Toggle } from "@dfinity/gix-components";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { validateUrl } from "$lib/utils/utils";
  import {
    INSTALL_CODE_CONTEXT_KEY,
    type InstallCodeContext,
  } from "$lib/types/install-code.context";

  const { store, next, selectFile, resetFile }: InstallCodeContext =
    getContext<InstallCodeContext>(INSTALL_CODE_CONTEXT_KEY);

  let showUrlInput = $store.source === "url";

  let urlInput = $store.url ?? "";
  let urlInputErrorMessage: string | undefined = undefined;

  let inputWasmName: string | undefined = undefined;

  onMount(() => updateInputWasmInfo());

  const updateUrlStore = () => {
    console.log("UPDATE", urlInput);

    store.update((values) => ({
      ...values,
      source: "url",
      url: urlInput !== "" ? urlInput : undefined,
      file: undefined,
    }));
  };

  const onToggle = () => {
    showUrlInput = !showUrlInput;

    urlInput = "";
    urlInputErrorMessage = undefined;

    resetFile();

    updateUrlStore();
  };

  const onBlur = () => {
    checkUrl();
    updateUrlStore();
  };

  const checkUrl = () =>
    (urlInputErrorMessage = validateUrl(urlInput)
      ? undefined
      : $i18n.error.invalid_url);

  let validUrl = false;
  $: validUrl = urlInputErrorMessage === undefined && urlInput.length > 0;

  let validFile = false;

  const updateInputWasmInfo = () => {
    validFile = $store.file !== undefined;
    inputWasmName = $store.file?.name;
  };

  $: $store, updateInputWasmInfo();

  let disableNext = false;
  $: disableNext = (showUrlInput && !validUrl) || (!showUrlInput && !validFile);

  const dispatcher = createEventDispatcher();
</script>

<p class="label">{$i18n.canisters.reinstall_text} {$i18n.canisters.insecure}</p>

<form on:submit|preventDefault={next}>
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
      on:blur={onBlur}
    >
      <svelte:fragment slot="label">{$i18n.canisters.enter_url}</svelte:fragment
      >
    </InputWithError>
  {:else}
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

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/text";

  p,
  form {
    z-index: calc(var(--z-index) + 1);
  }

  .label {
    margin-bottom: var(--padding-4x);
  }

  .toggle {
    display: flex;
    justify-content: flex-end;
    gap: var(--padding);
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

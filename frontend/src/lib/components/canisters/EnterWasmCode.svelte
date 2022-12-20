<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import { Spinner, Toggle } from "@dfinity/gix-components";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { isNullish, nonNullish, validateUrl } from "$lib/utils/utils";
  import {
    INSTALL_CODE_CONTEXT_KEY,
    type InstallCodeContext,
  } from "$lib/types/install-code.context";
  import { downloadBlob } from "$lib/utils/download.utils";
  import { sha256 } from "$lib/utils/crypto.utils";

  const { store, next, selectFile, resetFile }: InstallCodeContext =
    getContext<InstallCodeContext>(INSTALL_CODE_CONTEXT_KEY);

  let showUrlInput = $store.source === "url";

  let urlInput = $store.url ?? "";
  let urlInputErrorMessage: string | undefined = undefined;

  let inputWasmName: string | undefined = undefined;

  onMount(() => updateInputWasmInfo());

  let downloading = false;

  const updateUrlStore = async () => {
    store.update((values) => ({
      ...values,
      source: "url",
      url: urlInput !== "" ? urlInput : undefined,
      blob: undefined,
    }));

    urlInputErrorMessage = undefined;

    if (urlInput === "") {
      // Input is empty
      return;
    }

    if (!validateUrl(urlInput)) {
      urlInputErrorMessage = $i18n.error.invalid_url;
      return;
    }

    downloading = true;

    try {
      const wasmBlob = await downloadBlob(urlInput);

      store.update((values) => ({
        ...values,
        blob: wasmBlob,
      }));
    } catch (err: unknown) {
      urlInputErrorMessage = $i18n.error.cannot_download_wasm;
      console.error(err);
    }

    downloading = false;
  };

  const onToggle = () => {
    showUrlInput = !showUrlInput;

    urlInput = "";
    urlInputErrorMessage = undefined;

    resetFile();

    updateUrlStore();
  };

  let validUrl = false;
  $: validUrl = urlInputErrorMessage === undefined && urlInput.length > 0;

  let validFile = false;

  const updateInputWasmInfo = () => {
    validFile = $store.blob !== undefined && $store.source === "file";
    inputWasmName = validFile ? ($store.blob as File).name : undefined;
  };

  $: $store, updateInputWasmInfo();

  const dispatcher = createEventDispatcher();

  let hashInput = $store.hash ?? "";
  let validHash = false;

  const verifyHash = async () => {
    if (isNullish($store.blob)) {
      validHash = false;
      updateHashErrorMessage();
      return;
    }

    const sha = await sha256($store.blob);
    validHash = hashInput !== "" && hashInput === sha;
    updateHashErrorMessage();
  };

  $: hashInput, $store.blob, (async () => await verifyHash())();

  let hashErrorMessage: string | undefined = undefined;

  // Avoid flickering of the screen because computing hash is async
  const updateHashErrorMessage = () => {
    hashErrorMessage =
      !validHash && hashInput !== "" && nonNullish($store.blob)
        ? $i18n.canisters.invalid_hash
        : undefined;
  };

  const updateHashStore = async () => {
    store.update((values) => ({
      ...values,
      hash: hashInput !== "" ? hashInput : undefined,
    }));
  };

  let disableNext = true;
  $: disableNext =
    (showUrlInput && !validUrl) ||
    (!showUrlInput && !validFile) ||
    !validHash ||
    downloading;
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
      on:blur={updateUrlStore}
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

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      on:click={() => dispatcher("nnsClose")}
    >
      {$i18n.core.cancel}
    </button>

    <button type="submit" class="primary submit" disabled={disableNext}>
      {#if downloading}
        <Spinner size="small" />
      {:else}
        {$i18n.core.next}
      {/if}
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

  .submit {
    min-width: 100px;
  }
</style>

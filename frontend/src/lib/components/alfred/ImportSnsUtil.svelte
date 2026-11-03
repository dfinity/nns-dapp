<script lang="ts">
  import { goto } from "$app/navigation";
  import DEFAULT_SNS_LOGO from "$lib/assets/sns-logo-default.svg";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { MAX_IMPORTED_SNSES } from "$lib/constants/imported-snses.constants";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import {
    getSnsToImport,
    importSns,
    removeImportedSns,
  } from "$lib/services/imported-sns.services";
  import { i18n } from "$lib/stores/i18n";
  import {
    importedSnsesStore,
    loadedImportedSnsesStore,
  } from "$lib/stores/imported-snses.store";
  import {
    ImportedSnsError,
    type ImportedSnsErrorReason,
  } from "$lib/types/imported-sns.errors";
  import type { RootCanisterIdText } from "$lib/types/sns";
  import type { CachedSnsDto } from "$lib/types/sns-aggregator";
  import { errorToString } from "$lib/utils/error.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
  import { convertDtoToTokenMetadata } from "$lib/utils/sns-aggregator-converters.utils";
  import { IconAdd, IconBin, Input, Spinner } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { Principal } from "@icp-sdk/core/principal";
  import { onMount } from "svelte";

  let rootCanisterIdInputRef = $state<HTMLInputElement | undefined>();
  let rootCanisterIdInput = $state("");
  let snsToImport = $state<CachedSnsDto | undefined>();
  let errorMessage = $state<string | undefined>();
  let errorDetail = $state<string | undefined>();
  let busyMessage = $state<string | undefined>();

  const tokenSymbol = $derived(
    nonNullish(snsToImport)
      ? convertDtoToTokenMetadata(snsToImport.icrc1_metadata)?.symbol
      : undefined
  );

  const importedSnses = $derived(
    $importedSnsesStore.map((rootCanisterId) => ({
      rootCanisterId,
      name: $loadedImportedSnsesStore.snses.find(
        ({ canister_ids }) => canister_ids.root_canister_id === rootCanisterId
      )?.meta.name,
    }))
  );

  const errorMessages = $derived<Record<ImportedSnsErrorReason, string>>({
    "already-imported": $i18n.import_sns.error_already_imported,
    "already-listed": $i18n.import_sns.error_already_listed,
    limit: replacePlaceholders($i18n.import_sns.error_limit, {
      $max: `${MAX_IMPORTED_SNSES}`,
    }),
    "missing-canisters": $i18n.import_sns.error_missing_canisters,
    controllers: $i18n.import_sns.error_controllers,
    "minting-account": $i18n.import_sns.error_minting_account,
    "governance-mode": $i18n.import_sns.error_governance_mode,
  });

  const showError = (err: unknown) => {
    if (err instanceof ImportedSnsError) {
      errorMessage = errorMessages[err.reason];
      errorDetail = undefined;
      return;
    }

    errorMessage = $i18n.import_sns.error_load;
    errorDetail = errorToString(err);
  };

  const clearError = () => {
    errorMessage = undefined;
    errorDetail = undefined;
  };

  const check = async (event: SubmitEvent) => {
    event.preventDefault();
    clearError();

    let rootCanisterId: Principal;
    try {
      rootCanisterId = Principal.fromText(rootCanisterIdInput.trim());
    } catch (_) {
      errorMessage = $i18n.import_sns.error_invalid_id;
      return;
    }

    busyMessage = $i18n.import_sns.checking;
    try {
      snsToImport = await getSnsToImport(rootCanisterId);
    } catch (err) {
      showError(err);
    } finally {
      busyMessage = undefined;
    }
  };

  const confirmImport = async () => {
    if (!nonNullish(snsToImport)) return;

    busyMessage = $i18n.import_sns.importing;
    try {
      await importSns(
        Principal.fromText(snsToImport.canister_ids.root_canister_id)
      );
      snsToImport = undefined;
      rootCanisterIdInput = "";
    } catch (err) {
      showError(err);
    } finally {
      busyMessage = undefined;
    }
  };

  const back = () => {
    snsToImport = undefined;
    clearError();
  };

  const remove = async (rootCanisterId: RootCanisterIdText) => {
    removeImportedSns(Principal.fromText(rootCanisterId));

    // The page cannot show the universe of a removed SNS.
    if ($selectedUniverseIdStore.toText() === rootCanisterId) {
      await goto(buildSwitchUniverseUrl(OWN_CANISTER_ID_TEXT));
    }
  };

  onMount(() => {
    rootCanisterIdInputRef?.focus();
  });
</script>

<div class="util-form" data-tid="import-sns-util-component">
  <div class="util-header">
    <div class="util-icon">
      <IconAdd size="20" />
    </div>
    <div class="util-title">{$i18n.alfred.import_sns_title}</div>
  </div>

  {#if nonNullish(snsToImport)}
    <div class="review" data-tid="import-sns-review">
      <div class="sns">
        <Logo
          src={snsToImport.imported_logo ?? DEFAULT_SNS_LOGO}
          alt={snsToImport.meta.name ?? ""}
          size="big"
          framed
        />
        <div class="sns-text">
          <span class="sns-name" data-tid="import-sns-name"
            >{snsToImport.meta.name}</span
          >
          {#if nonNullish(tokenSymbol)}
            <span class="description" data-tid="import-sns-symbol"
              >{tokenSymbol}</span
            >
          {/if}
          <span class="description root-canister-id"
            >{snsToImport.canister_ids.root_canister_id}</span
          >
        </div>
      </div>

      <p class="warning" data-tid="import-sns-warning">
        {$i18n.import_sns.warning}
      </p>

      {#if nonNullish(errorMessage)}
        <div class="error-message" data-tid="import-sns-error">
          {errorMessage}
        </div>
      {/if}

      <div class="toolbar">
        <button
          class="secondary"
          type="button"
          data-tid="import-sns-back"
          disabled={nonNullish(busyMessage)}
          onclick={back}>{$i18n.import_sns.back}</button
        >
        <button
          class="primary"
          type="button"
          data-tid="import-sns-confirm"
          disabled={nonNullish(busyMessage)}
          onclick={confirmImport}>{$i18n.import_sns.import}</button
        >
      </div>
    </div>
  {:else}
    <form class="util-fields" onsubmit={check}>
      <p class="description">{$i18n.import_sns.description}</p>

      <div class="util-field">
        <label for="import-sns-root-canister-id"
          >{$i18n.import_sns.root_canister_id_label}</label
        >
        <div class="input-row">
          <Input
            inputType="text"
            name="import-sns-root-canister-id"
            placeholder={$i18n.import_sns.root_canister_id_placeholder}
            autocomplete="off"
            spellcheck={false}
            disabled={nonNullish(busyMessage)}
            testId="import-sns-root-canister-id"
            bind:value={rootCanisterIdInput}
            bind:inputElement={rootCanisterIdInputRef}
          />
          <button
            class="primary"
            type="submit"
            data-tid="import-sns-check"
            disabled={nonNullish(busyMessage) ||
              rootCanisterIdInput.trim() === ""}
            >{$i18n.import_sns.check}</button
          >
        </div>
      </div>

      {#if nonNullish(errorMessage)}
        <div class="error-message" data-tid="import-sns-error">
          {errorMessage}
          {#if nonNullish(errorDetail)}
            <span class="error-detail">{errorDetail}</span>
          {/if}
        </div>
      {/if}
    </form>

    {#if importedSnses.length > 0}
      <div class="imported" data-tid="import-sns-imported-list">
        <h5>{$i18n.import_sns.imported_list_title}</h5>
        <ul>
          {#each importedSnses as { rootCanisterId, name } (rootCanisterId)}
            <li data-tid="import-sns-imported-item">
              <div class="sns-text">
                {#if nonNullish(name)}
                  <span class="sns-name">{name}</span>
                {/if}
                <span class="description root-canister-id"
                  >{rootCanisterId}</span
                >
              </div>
              <button
                class="icon-only remove"
                type="button"
                data-tid="import-sns-remove"
                disabled={nonNullish(busyMessage)}
                aria-label={replacePlaceholders($i18n.import_sns.remove, {
                  $name: name ?? rootCanisterId,
                })}
                onclick={() => remove(rootCanisterId)}
              >
                <IconBin />
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/if}

  {#if nonNullish(busyMessage)}
    <div class="busy" data-tid="import-sns-busy">
      <Spinner inline size="small" />
      <span class="description">{busyMessage}</span>
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .util-form {
    padding: var(--padding-3x);
    background: var(--overlay-content-background);
    color: var(--overlay-content-background-contrast);

    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    .util-header {
      display: flex;
      align-items: center;
      gap: var(--padding-2x);
      margin-bottom: var(--padding);

      .util-icon {
        width: var(--padding-4x);
        height: var(--padding-4x);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
        flex-shrink: 0;
        border-radius: var(--padding);
        background: var(--card-background-tint);
      }

      .util-title {
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-lg);
        color: var(--text-color);
      }
    }
  }

  p {
    margin: 0;
  }

  .description {
    color: var(--text-description);
    @include fonts.small();
  }

  .util-fields {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    .util-field {
      display: flex;
      flex-direction: column;
      gap: var(--padding);

      label {
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
        @include fonts.small();
      }
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: var(--padding);

      --input-width: 100%;

      :global(.input-block) {
        flex: 1;
      }
    }
  }

  .sns {
    display: flex;
    align-items: center;
    gap: var(--padding-2x);
  }

  .sns-text {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
    min-width: 0;

    .sns-name {
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
      word-break: break-word;
    }
  }

  .root-canister-id {
    font-family: monospace;
    word-break: break-all;
  }

  .review {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    .warning {
      padding: var(--padding) var(--padding-2x);
      background: var(--card-background-tint);
      border-radius: var(--border-radius);
      color: var(--warning-emphasis);
      @include fonts.small();
    }

    .toolbar {
      display: flex;
      justify-content: flex-end;
      gap: var(--padding);
    }
  }

  .imported {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    h5 {
      margin: 0;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--padding);

      // The list can hold 20 SNSes. Keep the last ones in the viewport, also on a phone.
      // A browser without `dvh` support drops the second declaration.
      max-height: min(320px, 30vh);
      max-height: min(320px, 30dvh);
      overflow-y: auto;
    }

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--padding);
      padding: var(--padding) var(--padding-2x);
      background: var(--card-background-tint);
      border-radius: var(--border-radius);
    }

    .remove {
      color: var(--negative-emphasis);
      flex-shrink: 0;
    }
  }

  .error-message {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
    padding: var(--padding) var(--padding-2x);
    background: var(--card-background-tint);
    border-radius: var(--border-radius);
    color: var(--negative-emphasis);
    @include fonts.small();
    line-height: 1.5em;
    word-break: break-word;

    .error-detail {
      max-height: 8em;
      overflow-y: auto;
      color: var(--text-description);
      font-family: monospace;
    }
  }

  .busy {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }
</style>

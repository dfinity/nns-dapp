<script lang="ts">
  import type {
    UserTokenData,
    UserTokenFailed,
    UserTokenLoading,
  } from "$lib/types/tokens-page";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { isImportedToken } from "$lib/utils/imported-tokens.utils";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { IconError, Tag, Tooltip } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { isUserTokenFailed } from "$lib/utils/user-token.utils";

  export let rowData: UserTokenData | UserTokenLoading | UserTokenFailed;

  let importedToken = false;
  $: importedToken = isImportedToken({
    ledgerCanisterId: rowData?.universeId,
    importedTokens: $importedTokensStore.importedTokens,
  });
</script>

<div class="title-logo-wrapper">
  <Logo src={rowData.logo} alt={rowData.title} size="medium" framed />
  {#if isUserTokenFailed(rowData)}
    <Hash
      testId="failed-ledger-canister-id"
      text={`${rowData.universeId.toText()}`}
      tagName="span"
      splitLength={6}
      tooltipTop
    />
  {:else}
    <div class="title-wrapper">
      <h5 data-tid="project-name">{rowData.title}</h5>
      {#if nonNullish(rowData.subtitle)}
        <span data-tid="project-subtitle" class="description"
          >{rowData.subtitle}</span
        >
      {/if}
    </div>
  {/if}
  {#if importedToken}
    <Tag testId="imported-token-tag">{$i18n.import_token.imported_token}</Tag>
  {/if}
  {#if isUserTokenFailed(rowData)}
    <Tooltip
      id="failed-imported-token"
      testId="failed-imported-token-tooltip"
      text={$i18n.import_token.failed_tooltip}
    >
      <div class="failed-token-icon"><IconError size="20px" /></div>
    </Tooltip>
  {/if}
</div>

<style lang="scss">
  h5 {
    margin: 0;
  }

  .title-logo-wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);
    // Fix squashed logo for failed imported tokens caused by too many elements being displayed.
    flex-wrap: wrap;

    .title-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
    }
  }

  .failed-token-icon {
    color: var(--orange);
    line-height: 0;
  }
</style>

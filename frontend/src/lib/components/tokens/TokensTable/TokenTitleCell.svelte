<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import type {
    UserTokenData,
    UserTokenFailed,
    UserTokenLoading,
  } from "$lib/types/tokens-page";
  import { isImportedToken } from "$lib/utils/imported-tokens.utils";
  import { isUserTokenFailed } from "$lib/utils/user-token.utils";
  import { IconError, Tag, Tooltip } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

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
    <Hash text={`${rowData.universeId.toText()}`} tagName="span" tooltipTop />
  {:else}
    <div class="title-wrapper">
      <h5 data-tid="project-name" class="title">{rowData.title}</h5>
      {#if nonNullish(rowData.subtitle)}
        <span data-tid="project-subtitle" class="description subtitle"
          >{rowData.subtitle}</span
        >
      {/if}
    </div>
  {/if}
  {#if importedToken}
    <Tag testId="imported-token-tag">{$i18n.import_token.imported_token}</Tag>
  {/if}
  {#if isUserTokenFailed(rowData)}
    <div data-tid="failed-token-info" class="failed-token-info">
      <Tooltip id="failed-token-info" text={$i18n.import_token.failed_tooltip}>
        <IconError size="20px" />
      </Tooltip>
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .title,
  .subtitle {
    @include text.clamp(2);
    word-break: break-word;
  }

  h5 {
    margin: 0;
  }

  .title-logo-wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);

    // Fix squashed logo on mobile for failed imported tokens caused by too many elements being displayed.
    flex-wrap: wrap;
    @include media.min-width(medium) {
      flex-wrap: nowrap;
    }

    .title-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
    }
  }

  .failed-token-info {
    color: var(--orange);
    line-height: 0;
  }
</style>

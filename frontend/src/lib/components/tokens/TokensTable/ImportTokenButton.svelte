<script lang="ts">
  import { MAX_IMPORTED_TOKENS } from "$lib/constants/imported-tokens.constants";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { IconAdd, Tooltip } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    isModalVisible: boolean;
  };
  let { isModalVisible = $bindable() }: Props = $props();

  const importedTokens = $derived($importedTokensStore.importedTokens);
  const maximumImportedTokensReached = $derived(
    (importedTokens?.length ?? 0) >= MAX_IMPORTED_TOKENS
  );

  const showModal = () => (isModalVisible = true);
</script>

{#if nonNullish(importedTokens)}
  <Tooltip
    top
    testId="maximum-imported-tokens-tooltip"
    text={maximumImportedTokensReached
      ? replacePlaceholders($i18n.import_token.maximum_reached_tooltip, {
          $max: `${MAX_IMPORTED_TOKENS}`,
        })
      : undefined}
  >
    <button
      data-tid="import-token-button"
      class="button"
      onclick={showModal}
      disabled={maximumImportedTokensReached}
    >
      {$i18n.import_token.import_token}<span class="icon">
        <IconAdd />
      </span>
    </button>
  </Tooltip>
{/if}

<style lang="scss">
  .button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0;
    color: var(--gix-color-text);

    .icon {
      display: flex;
      color: var(--primary);
    }
  }
</style>

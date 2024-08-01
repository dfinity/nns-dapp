<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import UniverseLogo from "./UniverseLogo.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Tag } from "@dfinity/gix-components";
  import { isImportedToken } from "$lib/utils/imported-tokens.utils";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { Principal } from "@dfinity/principal";
  import { createEventDispatcher } from "svelte";

  export let universe: Universe;

  const dispatch = createEventDispatcher();

  // TODO: test me
  let importedToken = false;
  $: importedToken = isImportedToken({
    ledgerCanisterId: Principal.fromText(universe.canisterId),
    importedTokens: $importedTokensStore.importedTokens,
  });

  // TODO: remove me after context menu implementation
  const remove = () =>
    dispatch("nnsRemove", {
      ledgerCanisterId: Principal.fromText(universe.canisterId),
    });
</script>

<span class="summary" data-tid="universe-page-summary-component">
  <UniverseLogo {universe} framed horizontalPadding={false} />
  <span class="summary-title">{universe.title}</span>
  {#if importedToken}
    <Tag testId="imported-token-tag">{$i18n.import_token.imported_token}</Tag>
    <button
      class="ghost remove"
      type="button"
      on:click={remove}
      data-tid="remove-button">{$i18n.core.remove}</button
    >
  {/if}
</span>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .summary {
    display: flex;
    gap: var(--padding);
  }

  .summary-title {
    @include fonts.h3;
    @include text.truncate;
  }

  .remove {
    color: var(--negative-emphasis);
  }
</style>

<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { ENABLE_HIDE_ZERO_BALANCE } from "$lib/stores/feature-flags.store";
  import { IconSettings } from "@dfinity/gix-components";

  export let userTokensData: UserToken[];
</script>

<TestIdWrapper testId="tokens-page-component">
  <TokensTable
    {userTokensData}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header}
  >
    <div slot="header-icon">
      {#if $ENABLE_HIDE_ZERO_BALANCE}
        <button data-tid="settings-button" class="settings-button"
          ><IconSettings /></button
        >
      {/if}
    </div>
  </TokensTable>
</TestIdWrapper>

<style lang="scss">
  .settings-button {
    color: var(--text-description);

    // Prevents the element from adding space for descenders which would make it
    // take up more height than the icon itself.
    line-height: 0;
  }
</style>

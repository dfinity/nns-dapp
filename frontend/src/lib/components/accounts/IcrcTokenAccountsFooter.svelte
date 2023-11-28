<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { selectedIcrcTokenUniverseIdStore } from "$lib/derived/selected-universe.derived";
</script>

{#if nonNullish($selectedIcrcTokenUniverseIdStore)}
  <Footer testId="icrc-token-accounts-footer-component">
    <!-- TODO: Implement Send modal GIX-2120 -->
    <button
      class="primary full-width"
      data-tid="open-new-icrc-token-transaction">{$i18n.accounts.send}</button
    >
    <!-- TODO: Add Receive button GIX-2124 -->
  </Footer>
{/if}

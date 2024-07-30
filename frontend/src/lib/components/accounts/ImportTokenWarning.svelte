<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Html, IconError } from "@dfinity/gix-components";
  // TODO: replace with a generic component for warnings/errors when available
</script>

<article data-tid="import-token-warning">
  <span class="icon"><IconError size="24" /></span>
  <p><Html text={$i18n.import_token.warning} /></p>
</article>

<style lang="scss">
  article {
    display: flex;
    align-items: center;
    gap: var(--padding-1_5x);
    padding: var(--padding) var(--padding-1_5x);
    border-radius: var(--border-radius);
    background-color: var(--tooltip-background);
    color: var(--tooltip-text-color);
  }

  .icon {
    padding: var(--padding-0_5x);
    color: var(--alert);
  }

  p {
    margin: 0;
  }
</style>

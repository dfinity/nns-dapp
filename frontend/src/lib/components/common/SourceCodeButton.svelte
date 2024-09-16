<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconGitHub } from "@dfinity/gix-components";
</script>

<a
  data-tid="source-code-link"
  href="https://github.com/dfinity/nns-dapp"
  rel="noopener noreferrer external"
  target="_blank"
  class="source-code-button"
>
  <IconGitHub />
  {$i18n.navigation.source_code}
</a>

<style lang="scss">
  .source-code-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--padding-0_5x);
    padding: var(--padding);
    border-radius: var(--border-radius);
    color: var(--text-color);
    font-size: var(--font-size-small);
    text-decoration: none;

    background: var(--sidebar-button-background);
    &:hover {
      background: var(--sidebar-button-background-hover);
    }
  }
</style>

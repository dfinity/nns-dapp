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
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .source-code-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--padding-0_5x);
    padding: calc(var(--padding) * 1.5) var(--padding-2x);
    border-radius: var(--border-radius);
    color: var(--text-color);
    font-size: var(--font-size-small);
    text-decoration: none;

    background: rgba(var(--focus-background-rgb), 1);
    &:hover {
      background: rgba(var(--focus-background-rgb), 0.6);
    }
  }

  @include media.dark-theme {
    .source-code-button {
      background: rgba(var(--background-disable-rgb), 1);
      &:hover {
        background: rgba(var(--background-disable-rgb), 0.6);
      }
    }
  }
</style>

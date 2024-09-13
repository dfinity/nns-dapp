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
    padding: var(--padding-1_5x);
    border-radius: var(--border-radius);
    color: var(--text-color);
    font-size: var(--font-size-small);
    text-decoration: none;

    background: var(--cp-light-50, rgba(255, 255, 255, 0.45));
    &:hover {
      background: var(--cp-light-50);
    }
  }

  @include media.dark-theme {
    .source-code-button {
      background: var(--cp-dark-100, rgba(0, 0, 0, 0.2));
      &:hover {
        background: var(--cp-dark-900);
      }
    }
  }
</style>

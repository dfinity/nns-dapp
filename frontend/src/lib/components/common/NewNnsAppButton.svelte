<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconOpenInNew } from "@dfinity/gix-components";
</script>

<a
  data-tid="new-nns-app-link"
  href="https://nns.internetcomputer.org"
  rel="noopener noreferrer external"
  target="_blank"
  class="new-nns-app-button"
>
  <IconOpenInNew size="16" />
  {$i18n.highlight.new_nns_app_link}
</a>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  .new-nns-app-button {
    @include fonts.small;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--padding-0_5x);
    padding: var(--padding);
    border-radius: var(--border-radius);
    color: var(--text-color);
    text-decoration: none;

    background: var(--sidebar-button-background);
    &:hover {
      background: var(--sidebar-button-background-hover);
    }
  }
</style>

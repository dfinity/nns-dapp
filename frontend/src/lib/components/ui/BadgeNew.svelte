<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
</script>

<span>
  {$i18n.core.badgeNew}
</span>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  span {
    display: block;

    @include fonts.small;

    border-radius: var(--border-radius-0_5x);
    padding: var(--padding-0_25x) var(--padding-0_5x);
    margin: 0 0 var(--padding-0_25x);

    background: linear-gradient(
      113.27deg,
      #24133c 0%,
      #291641 49.25%,
      #29103c 100%
    );
    color: #9d5ac4;
  }

  @include media.light-theme {
    span {
      background: linear-gradient(113.27deg, #d5c7eb 0%, #eddcea 100%);
      color: #967dda;
    }
  }
</style>

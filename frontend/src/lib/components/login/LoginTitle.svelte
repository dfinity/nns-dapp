<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
</script>

<div class="title">
  <h1>{$i18n.auth.title}&nbsp;<span>{$i18n.auth.on_chain}</span></h1>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "../../themes/mixins/login";

  .title {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    z-index: var(--z-index);

    @include media.min-width(large) {
      padding-top: 0;
    }
  }

  h1 {
    text-align: center;

    letter-spacing: -0.02em;

    color: var(--value-color);

    span {
      display: block;
    }

    font-size: var(--font-size-h1);
    line-height: var(--line-height-standard);

    @media (min-width: 440px) {
      font-size: calc(var(--font-size-h1) * 2);
      line-height: 1;
    }

    @include login.min-size(medium) {
      font-size: calc(var(--font-size-h1) * 3);
      line-height: 1;
    }

    @include login.min-size(xlarge) {
      font-size: calc(var(--font-size-h1) * 5);
      line-height: 1;
    }
  }

  @include media.light-theme {
    h1 {
      color: inherit;
    }
  }
</style>

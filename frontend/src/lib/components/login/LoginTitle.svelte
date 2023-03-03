<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
</script>

<div class="title">
  <h1>{$i18n.auth.title}&nbsp;<span>{$i18n.auth.on_chain}</span></h1>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
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

    font-size: var(--font-size-h3);
    line-height: var(--line-height-standard);

    @media (min-width: 320px) {
      font-size: var(--font-size-h1);
    }

    @media (min-width: 480px) {
      font-size: calc(var(--font-size-h1) * 1.4);
      line-height: 1;
    }

    @media (min-width: 640px) {
      font-size: calc(var(--font-size-h1) * 2);
    }

    @include login.min-size(medium) {
      font-size: 76px;
      width: 90%;
    }

    @include login.min-size(xlarge) {
      font-size: calc(var(--font-size-h1) * 4);
    }
  }

  @include media.light-theme {
    h1 {
      color: inherit;
    }
  }
</style>

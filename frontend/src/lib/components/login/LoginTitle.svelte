<script lang="ts">
    import {i18n} from "$lib/stores/i18n";
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
    padding-top: var(--padding-6x);

    @include login.min-size(medium) {
      padding-top: 0;
    }
  }

  h1 {
    font-size: inherit;
    line-height: var(--line-height-standard);
    text-align: center;

    letter-spacing: -0.02em;

    color: var(--value-color);

    span {
      display: block;
    }

    display: none;

    @media (min-height: 300px) {
      display: block;
    }

    @media (min-height: 380px) {
      font-size: calc(var(--font-size-h1) * 1.2);
    }

    @media (min-width: 440px) and (min-height: 860px) {
      font-size: calc(var(--font-size-h1) * 2.5);
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
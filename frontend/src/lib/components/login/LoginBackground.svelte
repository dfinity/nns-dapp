<script lang="ts">
  import png576 from "$lib/assets/login/576.png";
  import png768 from "$lib/assets/login/768.png";
  import png1024 from "$lib/assets/login/1024.png";
  import png1300 from "$lib/assets/login/1300.png";
  import { i18n } from "$lib/stores/i18n";

  // Breakpoints source: https://css-tricks.com/optimizing-large-scale-displays/
</script>

<picture>
  <source type="image/jpeg" media="(min-width: 1920px)" srcset={png1300} />
  <source type="image/jpeg" media="(min-width: 1366px)" srcset={png1024} />
  <source type="image/jpeg" media="(min-width: 1024px)" srcset={png768} />
  <source type="image/jpeg" srcset={png576} />
  <img
    src={png576}
    role="presentation"
    alt={$i18n.auth.background}
    decoding="async"
  />
</picture>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  picture {
    position: absolute;
    top: 22%;
    left: 50%;
    transform: translate(-50%, -50%);

    @include media.min-width(large) {
      top: 45%;
    }
  }

  img {
    max-width: 100%;
  }
</style>

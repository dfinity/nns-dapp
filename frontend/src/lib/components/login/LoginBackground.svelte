<script lang="ts">
  import png576 from "$lib/assets/login/576.png";
  import png768 from "$lib/assets/login/768.png";
  import png1024 from "$lib/assets/login/1024.png";
  import { i18n } from "$lib/stores/i18n";
</script>

<picture>
  <source media="(min-width: 1024px)" srcset={png1024} />
  <source media="(min-width: 768px)" srcset={png768} />
  <img
    src={png576}
    role="presentation"
    alt={$i18n.auth.background}
    decoding="async"
  />
</picture>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "../../themes/mixins/login";

  picture {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);

    @include media.min-width(medium) {
      top: 40%;
    }
    @include media.min-width(large) {
      top: 60%;
    }
    @include login.min-size(xlarge) {
      top: 45%;
    }
  }

  img {
    @include media.min-width(xlarge) {
      max-width: 100%;
    }
  }
</style>

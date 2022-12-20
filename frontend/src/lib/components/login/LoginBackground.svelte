<script lang="ts">
  import png576 from "$lib/assets/login/576.png";
  import png768 from "$lib/assets/login/768.png";
  import png1024 from "$lib/assets/login/1024.png";
  import png1300 from "$lib/assets/login/1300.png";
  import png1920 from "$lib/assets/login/1920.png";

  // Breakpoints source: https://css-tricks.com/optimizing-large-scale-displays/
</script>

<picture>
  <source type="image/jpeg" media="(min-width: 2560px)" srcset={png1920}>
  <source type="image/jpeg" media="(min-width: 1920px)" srcset={png1300}>
  <source type="image/jpeg" media="(min-width: 1366px)" srcset={png1024}>
  <source type="image/jpeg" media="(min-width: 1024px)" srcset={png768}>
  <source type="image/jpeg" srcset={png576}>
  <img src={png576} role="presentation" alt="An abstract image for design and presentation purpose only" decoding="async">
</picture>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "../../../lib/themes/mixins/login";

  picture {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: none;

    @media (min-height: 380px) {
      display: block;
    }

    @include media.min-width(medium) {
      top: 38%;
    }

    @include login.min-size(medium) {
      top: 40%;
    }

    @include login.min-size(large) {
      top: 45%;
    }
  }

  img {
    aspect-ratio: 1;

    max-height: 40vh;
    min-height: 30vh;

    @include media.min-width(large) {
      max-height: 60vh;
      min-height: 40vh;
      aspect-ratio: 1;
    }
  }
</style>
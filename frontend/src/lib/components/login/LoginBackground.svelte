<script lang="ts">
  import png576 from "$lib/assets/login/576.png";
  import png768 from "$lib/assets/login/768.png";
  import png1024 from "$lib/assets/login/1024.png";
  import png1300 from "$lib/assets/login/1300.png";

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
    alt="An abstract image for design and presentation purpose only"
    decoding="async"
  />
</picture>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  picture {
    position: absolute;
    top: 28%;
    left: 50%;
    transform: translate(-50%, -50%);

    @include media.min-width(small) {
      top: 40%;
    }

    @include media.min-width(large) {
      top: 54%;
    }
  }

  img {
    width: 40rem;
    max-width: calc(100vw - var(--padding-8x));
    aspect-ratio: 1;

    @include media.min-width(small) {
      width: 34rem;
    }

    @include media.min-width(large) {
      width: 50rem;
    }
  }
</style>

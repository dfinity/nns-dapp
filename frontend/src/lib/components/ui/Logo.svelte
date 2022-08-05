<script lang="ts">
  export let src: string;
  export let alt: string;
</script>

<img {src} {alt} loading="lazy" />

<style lang="scss">
  img {
    width: var(--padding-3x);
    height: var(--padding-3x);
    border-radius: var(--border-radius);
    border: 2px solid var(--background-contrast);
  }
</style>

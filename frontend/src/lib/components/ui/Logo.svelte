<script lang="ts">
  export let src: string;
  export let alt: string;
  export let size: "big" | "small" = "small";
  export let framed = true;
</script>

<img
  {src}
  {alt}
  role="presentation"
  loading="lazy"
  class:big={size === "big"}
  class:framed
/>

<style lang="scss">
  img {
    width: var(--padding-3x);
    height: var(--padding-3x);
  }

  .framed {
    border-radius: var(--border-radius);
    border: 2px solid var(--background-contrast);
  }

  .big {
    width: var(--padding-6x);
    height: var(--padding-6x);
  }
</style>

<script lang="ts">
  export let src: string;
  export let alt: string;
  export let size: "big" | "small" = "small";
  export let framed = true;
  export let testId: string | undefined = undefined;
</script>

<img
  {src}
  {alt}
  role="presentation"
  loading="lazy"
  data-tid={testId}
  class:big={size === "big"}
  class:framed
/>

<style lang="scss">
  img {
    width: var(--padding-3x);
    height: var(--padding-3x);

    display: var(--logo-display);
  }

  .framed {
    border-radius: 50%;
    background: var(--logo-framed-background, var(--background));
    padding: var(--padding-0_25x);
  }

  .big {
    width: var(--padding-6x);
    height: var(--padding-6x);
  }
</style>

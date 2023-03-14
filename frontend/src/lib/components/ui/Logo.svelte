<script lang="ts">
  export let src: string;
  export let alt: string;
  export let size: "huge" | "big" | "medium" | "small" = "small";
  export let framed = true;
  export let testId: string | undefined = undefined;
</script>

<img
  {src}
  {alt}
  role="presentation"
  loading="lazy"
  draggable="false"
  data-tid={testId}
  class:huge={size === "huge"}
  class:big={size === "big"}
  class:medium={size === "medium"}
  class:framed
/>

<style lang="scss">
  img {
    width: var(--padding-3x);
    height: var(--padding-3x);

    user-select: none;
    -webkit-user-drag: none;
  }

  .framed {
    border-radius: 50%;
    background: var(--logo-framed-background, var(--background));
    padding: var(--padding-0_25x);
  }

  .huge {
    width: var(--padding-8x);
    height: var(--padding-8x);
  }

  .big {
    width: var(--padding-6x);
    height: var(--padding-6x);
  }

  .medium {
    width: var(--padding-4x);
    height: var(--padding-4x);
  }
</style>

<script lang="ts">
  export let testId = "logo-wrapper-component";
  export let size: "huge" | "big" | "medium" | "small" = "small";
  export let framed = true;
</script>

<div
  data-tid={testId}
  class:huge={size === "huge"}
  class:big={size === "big"}
  class:medium={size === "medium"}
  class:framed
  class="wrapper"
>
  <slot />
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;

    width: var(--padding-3x);
    height: var(--padding-3x);

    user-select: none;
    -webkit-user-drag: none;
  }

  .framed {
    border-radius: 50%;
    background: var(--logo-framed-background, var(--background));
    padding: var(--padding-0_25x);
    overflow: hidden;
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

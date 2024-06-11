<script lang="ts">
  import LogoWrapper from "$lib/components/ui/LogoWrapper.svelte";

  export let src: string;
  export let alt: string;
  export let size: "huge" | "big" | "medium" | "small" = "small";
  export let framed = true;
  export let testId: string | undefined = undefined;
</script>

<LogoWrapper {size} {framed} testId="logo-component">
  <img
    {src}
    {alt}
    class:framed
    role="presentation"
    loading="lazy"
    draggable="false"
    data-tid={testId}
  />
</LogoWrapper>

<style lang="scss">
  img {
    width: 100%;
    height: 100%;

    &.framed {
      border-radius: 50%;
    }
  }
</style>

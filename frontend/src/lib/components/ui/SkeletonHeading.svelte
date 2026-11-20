<script lang="ts">
  import PageHeading from "$lib/components/common/PageHeading.svelte";
  import { SkeletonText } from "$lib/gix";
</script>

<PageHeading>
  <div slot="title">
    <SkeletonText tagName="h1" />
  </div>
</PageHeading>

<style lang="scss">
  @use "../../gix/styles/mixins/media";

  div {
    // This is a width for the skeleton that looks good on desktop and mobile.
    // Based on $breakpoint-xsmall: 320px;
    width: 320px;
    max-width: calc(100% - var(--padding-2x));
  }
</style>

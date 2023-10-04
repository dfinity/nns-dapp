<script lang="ts">
  import { SkeletonText } from "@dfinity/gix-components";
  import PageHeading from "../common/PageHeading.svelte";
</script>

<PageHeading>
  <div slot="title">
    <SkeletonText tagName="h1" />
  </div>
</PageHeading>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  div {
    // This is a width for the skeleton that looks good on desktop and mobile.
    // Based on $breakpoint-xsmall: 320px;
    width: 320px;
    max-width: calc(100% - var(--padding-2x));
  }
</style>

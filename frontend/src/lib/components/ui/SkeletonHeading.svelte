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
    width: 90%;

    @include media.min-width(small) {
      width: 40%;
    }
  }
</style>

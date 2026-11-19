<script lang="ts">
  import PageHeader from "$lib/components/common/PageHeader.svelte";
  import { SkeletonText } from "$lib/gix";
</script>

<PageHeader>
  <div slot="start">
    <SkeletonText />
  </div>
  <div slot="end">
    <SkeletonText />
  </div>
</PageHeader>

<style lang="scss">
  @use "../../gix/styles/mixins/media";

  div {
    width: 90%;

    @include media.min-width(small) {
      width: 40%;
    }
  }
</style>

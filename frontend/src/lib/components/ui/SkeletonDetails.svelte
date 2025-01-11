<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
</script>

<TestIdWrapper testId="skeleton-details-component">
  <div class="content-cell-title">
    <SkeletonText tagName="h1" />
  </div>
  <div class="content-cell-details">
    <SkeletonText />
    <SkeletonText />
    <SkeletonText />
    <SkeletonText />
    <SkeletonText />
  </div>
</TestIdWrapper>

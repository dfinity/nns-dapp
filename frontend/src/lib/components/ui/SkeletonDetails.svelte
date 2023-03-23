<script lang="ts">
  import { SkeletonText } from "@dfinity/gix-components";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";
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

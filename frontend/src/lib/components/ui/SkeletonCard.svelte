<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import type { CardType } from "$lib/types/card";
  import CardInfo from "./CardInfo.svelte";
  import SkeletonCardContent from "./SkeletonCardContent.svelte";
  import { Card } from "@dfinity/gix-components";
  import { SkeletonText } from "@dfinity/gix-components";

  export let size: "small" | "medium" | "large" = "small";
  export let cardType: CardType = "card";
  export let separator = false;
  export let noMargin = false;
</script>

<!-- We need to explictly use the `Card` or `CardInfo` because props are different -->
{#if cardType === "info"}
  <CardInfo {noMargin} testId="skeleton-card">
    <div class="small" slot="start">
      <SkeletonText />
    </div>
    <div class="small" slot="end">
      <SkeletonText />
    </div>
    <SkeletonCardContent {size} />
  </CardInfo>
{:else}
  <Card testId="skeleton-card">
    <div class="small" slot="start">
      <SkeletonText />
    </div>
    <div class="small" slot="end">
      <SkeletonText />
    </div>
    <SkeletonCardContent {size} />
  </Card>
{/if}

{#if separator}
  <Separator />
{/if}

<style lang="scss">
  .small {
    width: 20%;
  }
</style>

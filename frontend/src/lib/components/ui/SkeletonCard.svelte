<script lang="ts">
  import { Card } from "@dfinity/gix-components";
  import CardInfo from "./CardInfo.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
  import type { SvelteComponent } from "svelte";
  import type { CardType } from "../../types/card";

  export let size: "medium" | "large" = "medium";
  export let cardType: CardType = "card";

  const cards: Record<CardType, typeof SvelteComponent> = {
    card: Card,
    info: CardInfo,
  };
</script>

<svelte:component this={cards[cardType]} testId="skeleton-card">
  <div class="small" slot="start">
    <SkeletonText />
  </div>
  <div class="small" slot="end">
    <SkeletonText />
  </div>
  <div class="content">
    <SkeletonText />
    <SkeletonText />
    {#if size === "large"}
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    {/if}
  </div>
</svelte:component>

<style lang="scss">
  .small {
    width: 20%;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding_2x);
  }
</style>

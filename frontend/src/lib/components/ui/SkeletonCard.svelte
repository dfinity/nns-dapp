<script lang="ts">
  import { Card } from "@dfinity/gix-components";
  import CardInfo from "./CardInfo.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
  import type { ComponentType } from "svelte";
  import type { CardType } from "$lib/types/card";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let size: "small" | "medium" | "large" = "small";
  export let cardType: CardType = "card";
  export let separator = false;

  const cards: Record<CardType, ComponentType> = {
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

    {#if ["large", "medium"].includes(size)}
      <SkeletonText />
      <SkeletonText />
    {/if}

    {#if size === "large"}
      <SkeletonText />
      <SkeletonText />
    {/if}
  </div>
</svelte:component>

{#if separator}
  <Separator />
{/if}

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

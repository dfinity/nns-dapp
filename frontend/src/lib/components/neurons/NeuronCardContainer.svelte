<script lang="ts">
  import type { CardType } from "$lib/types/card";
  import { Card } from "@dfinity/gix-components";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";

  export let role: undefined | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected = false;
  export let disabled: boolean | undefined = undefined;
  export let href: string | undefined = undefined;

  export let cardType: CardType;
</script>

{#if cardType === "card"}
  <Card {role} {selected} {disabled} on:click {href} {ariaLabel} testId="neuron-card">
    <svelte:fragment><slot /></svelte:fragment>
    <svelte:fragment slot="start"><slot name="start" /></svelte:fragment>
    <svelte:fragment slot="end"><slot name="end" /></svelte:fragment>
  </Card>
{:else}
  <CardInfo testId="neuron-card">
    <svelte:fragment><slot /></svelte:fragment>
    <svelte:fragment slot="start"><slot name="start" /></svelte:fragment>
    <svelte:fragment slot="end"><slot name="end" /></svelte:fragment>
  </CardInfo>
{/if}

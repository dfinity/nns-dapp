<script lang="ts">
  import type { CardType } from "../../types/card";
  import Card from "../ui/Card.svelte";
  import CardInfo from "../ui/CardInfo.svelte";

  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected: boolean = false;
  export let disabled: boolean | undefined = undefined;

  export let cardType: CardType;
</script>

{#if cardType === "card"}
  <Card {role} {selected} {disabled} on:click {ariaLabel} testId="neuron-card">
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

<script lang="ts">
  import CardItem from "../../../../lib/components/ui/CardItem.svelte";

  export let title: string;
  export let subtitle: string;
  export let testId: string | undefined = undefined;
</script>

<CardItem on:click {testId}>
  <svelte:fragment slot="title">{title}</svelte:fragment>
  <svelte:fragment slot="subtitle">{subtitle}</svelte:fragment>
</CardItem>

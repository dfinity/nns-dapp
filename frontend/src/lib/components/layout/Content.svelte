<script lang="ts">
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";
  import Title from "$lib/components/header/Title.svelte";
  import { Content } from "@dfinity/gix-components";
  import type { Snippet } from "svelte";

  type Props = {
    back?: () => Promise<void>;
    children: Snippet;
  };
  const { back, children }: Props = $props();
</script>

<Content onBack={back}>
  {#snippet title()}
    <Title />
  {/snippet}

  {#snippet toolbarEnd()}
    <HeaderToolbar />
  {/snippet}
  {@render children()}
</Content>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/layout";

  :global(.content .toolbar .back) {
    background-color: var(--sidebar-button-background);
    min-width: 0 !important;
    height: 28px;
    width: 28px;
  }
</style>

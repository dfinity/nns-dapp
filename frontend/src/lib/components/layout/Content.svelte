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
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  :global(.content .toolbar .back) {
    background-color: var(--cp-light-50-45);
    min-width: 0 !important;
    height: 28px;
    width: 28px;
  }

  @include media.dark-theme {
    :global(.content .toolbar .back) {
      background-color: var(--neutral-blue-a10);
    }
  }
</style>

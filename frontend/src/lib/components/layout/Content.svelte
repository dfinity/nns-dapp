<script lang="ts">
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";
  import Title from "$lib/components/header/Title.svelte";
  import { Content } from "@dfinity/gix-components";

  type Props = {
    back?: () => Promise<void>;
  };

  const { back }: Props = $props();
</script>

<Content onBack={back}>
  {#snippet title()}
    <Title />
  {/snippet}

  {#snippet toolbarEnd()}
    <HeaderToolbar />
  {/snippet}
  <div> </div>
</Content>

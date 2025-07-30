<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  // const back = (): Promise<void> => goto($neuronsPageOrigin);
</script>

<Layout title={$i18n.navigation.neurons_account}>
  <Content>
    {@render children()}
  </Content>
</Layout>

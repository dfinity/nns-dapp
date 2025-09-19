<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { logWithTimestamp } from "$lib/utils/dev.utils";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  const title = $i18n.navigation.portfolio;

  logWithTimestamp("#4124:(app)(home)l");
</script>

<Layout {title}>
  <Content>
    {@render children()}
  </Content>
</Layout>

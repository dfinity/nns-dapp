<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { projectPageOrigin } from "$lib/derived/routes.derived";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  const back = (): Promise<void> => goto($projectPageOrigin);
</script>

<Layout>
  <Content {back}>
    {@render children()}
  </Content>
</Layout>

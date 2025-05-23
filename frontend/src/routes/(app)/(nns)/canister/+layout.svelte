<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  const back = (): Promise<void> => goto(AppPath.Canisters);
</script>

<Layout>
  <Content {back}>
    {@render children()}
  </Content>
</Layout>

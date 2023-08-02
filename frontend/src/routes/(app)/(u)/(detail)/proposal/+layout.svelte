<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import { proposalsPathStore } from "$lib/derived/paths.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { referrerPathStore } from "$lib/stores/referrerPath.store";

  const back = (): Promise<void> =>
    goto(
      $referrerPathStore === AppPath.Launchpad
        ? $referrerPathStore
        : $proposalsPathStore
    );
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
</LayoutNavGuard>

<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import { proposalsPathStore } from "$lib/derived/paths.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { referrerPathStore } from "$lib/stores/routes.store";

  const back = (): Promise<void> => {
    // This is a hack to jump back to the specific project page (because of the query params)
    if ($referrerPathStore === AppPath.Project) {
      history.back();
      return Promise.resolve();
    }

    return goto(
      $referrerPathStore === AppPath.Launchpad
        ? $referrerPathStore
        : $proposalsPathStore
    );
  };
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
</LayoutNavGuard>

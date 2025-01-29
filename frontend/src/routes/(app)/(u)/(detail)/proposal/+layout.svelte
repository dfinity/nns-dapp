<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { proposalsPathStore } from "$lib/derived/paths.derived";
  import { referrerPathStore } from "$lib/stores/routes.store";

  const back = async (): Promise<void> => {
    const lastReferrer = $referrerPathStore.at(-1);
    // This is a hack to jump back to the specific project page (because of the query params)
    if (lastReferrer === AppPath.Project) {
      history.back();
      return;
    }

    goto(
      lastReferrer === AppPath.Launchpad ? lastReferrer : $proposalsPathStore
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

<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";

  const back = (): Promise<void> => goto(AppPath.Staking);
</script>

<LayoutList title={$i18n.navigation.neurons}>
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
</LayoutList>

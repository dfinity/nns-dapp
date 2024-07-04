<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { ENABLE_PROJECTS_TABLE } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";

  const back = (): Promise<void> => goto(AppPath.Staking);
</script>

<LayoutList title={$i18n.navigation.neurons}>
  <Layout>
    {#if $ENABLE_PROJECTS_TABLE}
      <Content {back}>
        <slot />
      </Content>
    {:else}
      <UniverseSplitContent>
        <slot />
      </UniverseSplitContent>
    {/if}
  </Layout>
</LayoutList>

<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import { accountsPathStore } from "$lib/derived/paths.derived";
  import { isNullish } from "@dfinity/utils";
  import { navigating } from "$app/stores";

  const back = (): Promise<void> => goto($accountsPathStore);
</script>

<!-- Workaround for SvelteKit issue https://github.com/sveltejs/kit/issues/5434 -->
{#if isNullish($navigating)}
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
{/if}

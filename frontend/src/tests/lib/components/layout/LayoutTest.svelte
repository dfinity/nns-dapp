<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let content = "";
  export let spy: (() => void) | undefined = undefined;

  const back = async () => spy?.();
</script>

<Layout>
  <Content back={nonNullish(spy) ? back : undefined}>
    <p>{content}</p>
  </Content>
</Layout>

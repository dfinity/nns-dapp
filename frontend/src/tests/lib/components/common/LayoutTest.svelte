<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import Content from "$lib/components/common/Content.svelte";
  import { nonNullish } from "$lib/utils/utils";

  export let content = "";
  export let spy: (() => void) | undefined = undefined;

  const back = () => spy?.();
</script>

<Layout>
  <Content back={nonNullish(spy) ? back : undefined}>
    <p>{content}</p>
  </Content>
</Layout>

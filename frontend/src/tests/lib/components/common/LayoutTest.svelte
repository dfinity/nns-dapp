<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import Content from "$lib/components/common/Content.svelte";

  export let content: string;
  export let spy: () => void;

  const back = () => spy();
</script>

<Layout>
  <Content {back}>
    <p>{content}</p>
  </Content>
</Layout>

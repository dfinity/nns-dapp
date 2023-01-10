<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
</script>

<Layout>
  <Content>
    <slot />
  </Content>
</Layout>

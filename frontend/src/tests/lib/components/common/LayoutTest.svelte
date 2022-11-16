<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";

  export let content: string;
  export let spy: () => void;

  const back = () => spy();
</script>

<Layout {back}>
  <p>{content}</p>
</Layout>

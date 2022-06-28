<script lang="ts">
  import Layout from "../../../../lib/components/common/Layout.svelte";
  import { layoutBackStore } from "../../../../lib/stores/layout.store";

  export let content: string;
  export let spy: () => void;

  const goBack = () => spy();

  layoutBackStore.set(goBack);
</script>

<Layout>
  <p>{content}</p>
</Layout>

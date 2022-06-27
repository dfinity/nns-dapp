<script lang="ts">
  import Layout from "../../../../lib/components/common/Layout.svelte";

  export let header: string;
  export let content: string;
  export let button: string;
  export let spy: () => void;

  const goBack = () => spy();
</script>

<Layout on:nnsBack={goBack} layout="detail">
  <svelte:fragment slot="header">{header}</svelte:fragment>

  <p>{content}</p>

  <svelte:fragment slot="footer">
    <!-- <Toolbar> -->
    <button class="primary">{button}</button>
    <!-- </Toolbar> -->
  </svelte:fragment>
</Layout>

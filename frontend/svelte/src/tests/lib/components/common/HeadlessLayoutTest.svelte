<script lang="ts">
  import HeadlessLayout from "../../../../lib/components/common/HeadlessLayout.svelte";

  export let header: string;
  export let content: string;
  export let button: string;
  export let spy: () => void;

  const goBack = () => spy();
</script>

<HeadlessLayout on:nnsBack={goBack}>
  <svelte:fragment slot="header">{header}</svelte:fragment>

  <p>{content}</p>

  <svelte:fragment slot="footer">
    <!-- <Toolbar> -->
    <button class="primary">{button}</button>
    <!-- </Toolbar> -->
  </svelte:fragment>
</HeadlessLayout>

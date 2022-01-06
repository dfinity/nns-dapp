<script lang="ts">
  import Layout from '../lib/components/Layout.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace('/#/voting');
    }
  });
</script>

<Layout>
  <section>
    <h1>Voting page</h1>
  </section>
</Layout>

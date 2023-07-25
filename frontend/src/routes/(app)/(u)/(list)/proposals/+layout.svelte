<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
</script>

<Layout>
  <UniverseSplitContent>
    <slot />
  </UniverseSplitContent>
</Layout>

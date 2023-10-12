<script lang="ts">
  import Launchpad from "$routes/(app)/(nns)/launchpad/+page.svelte";
  import LaunchpadLayout from "$routes/(app)/(nns)/launchpad/+layout.svelte";
  import MainLayout from "$routes/(app)/+layout.svelte";
</script>

<MainLayout>
  <LaunchpadLayout>
    <Launchpad />
  </LaunchpadLayout>
</MainLayout>

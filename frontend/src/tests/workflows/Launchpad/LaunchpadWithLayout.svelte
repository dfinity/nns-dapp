<script lang="ts">
  import LaunchpadLayout from "$routes/(app)/(nns)/launchpad/+layout.svelte";
  import Launchpad from "$routes/(app)/(nns)/launchpad/+page.svelte";
  import MainLayout from "$routes/(app)/+layout.svelte";
</script>

<MainLayout>
  <LaunchpadLayout>
    <Launchpad />
  </LaunchpadLayout>
</MainLayout>

<script lang="ts">
  import Projects from "$lib/components/launchpad/Projects.svelte";
  import Proposals from "$lib/components/launchpad/Proposals.svelte";
  import { i18n } from "$lib/stores/i18n";
</script>

<main>
  <h2>{$i18n.sns_launchpad.projects}</h2>
  <Projects />

  <h2>{$i18n.sns_launchpad.proposals}</h2>
  <Proposals />
</main>

<style lang="scss">
  h2 {
    margin: var(--padding-8x) 0 var(--padding-3x);

    &:first-of-type {
      margin-top: var(--padding);
    }
  }
</style>

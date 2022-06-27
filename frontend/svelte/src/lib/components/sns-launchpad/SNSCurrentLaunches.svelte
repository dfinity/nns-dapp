<script lang="ts">
  import {
    listSnsSummary,
    loadSnsSwapState,
  } from "../../services/sns.services";
  import type { SnsSummary } from "../../services/sns.services.mock";

  import { i18n } from "../../stores/i18n";
  import Card from "../ui/Card.svelte";

  let projects: SnsSummary[] = [];
  (async () => {
    projects = await listSnsSummary();

    projects.forEach(async ({ rootCanisterId }) => {
      console.log(rootCanisterId);

      console.log(await loadSnsSwapState(rootCanisterId));
    });
  })();
</script>

<h2>{$i18n.sns_launchpad.current_launches}</h2>

{#each projects as { logo, name, description }}
  <Card role="link">
    <img slot="start" src={logo} alt="project logo" />
    <h3 slot="end">{$i18n.sns_launchpad.project} {name}</h3>
    <p>{description}</p>
  </Card>
{/each}

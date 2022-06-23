<script lang="ts">
import { logout } from "../../services/auth.services";
import { listSNSProjects, type SnsSummary } from "../../services/sns.service";

  import { i18n } from "../../stores/i18n";
import Card from "../ui/Card.svelte";

  let projects: SnsSummary[] = [];
  (async () => projects = await listSNSProjects())();
</script>

<h2>{$i18n.sns_launchpad.current_launches}</h2>

{#each projects as {logo, name, description}}
  <Card role="link">
    <img slot="start" src={logo} alt="project logo">
    <h3 slot="end">{$i18n.sns_launchpad.project} {name}</h3>
    <p>{description}</p>
  </Card>
{/each}

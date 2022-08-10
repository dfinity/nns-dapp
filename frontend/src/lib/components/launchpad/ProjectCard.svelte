<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import { AppPath } from "../../constants/routes.constants";
  import type { SnsSummary, SnsSwapCommitment } from "../../types/sns";

  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import type { SnsFullProject } from "../../stores/projects.store";
  import Card from "../ui/Card.svelte";
  import Logo from "../ui/Logo.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import ProjectCardSwapInfo from "./ProjectCardSwapInfo.svelte";

  export let project: SnsFullProject;

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined;
  $: ({ summary, swapCommitment } = project);

  let logo: string;
  let name: string;
  let description: string;
  $: ({
    metadata: { logo, name, description },
  } = summary);

  let title: string;
  $: title = `${$i18n.sns_project.project} ${name}`;

  let myCommitment: ICP | undefined;

  const showProject = () => {
    routeStore.navigate({
      path: `${AppPath.ProjectDetail}/${project.rootCanisterId.toText()}`,
    });
  };
</script>

<Card
  role="link"
  on:click={showProject}
  highlighted={myCommitment !== undefined}
>
  <div class="title" slot="start">
    <Logo src={logo} alt={$i18n.sns_launchpad.project_logo} />
    <h3>{title}</h3>
  </div>

  <p class="value description">{description}</p>

  <ProjectCardSwapInfo {project} bind:myCommitment />

  <!-- TODO L2-751: handle fetching errors -->
  {#if swapCommitment === undefined}
    <div class="spinner">
      <Spinner size="small" inline />
    </div>
  {/if}
</Card>

<style lang="scss">
  @use "../../themes/mixins/text";

  .title {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: flex-start;
    margin-bottom: var(--padding);

    h3 {
      margin: 0;
      line-height: var(--line-height-standard);
      @include text.clamp(2);
    }
  }

  p {
    margin: 0 0 var(--padding-1_5x);
  }

  .spinner {
    margin-top: var(--padding-1_5x);
  }

  .description {
    @include text.clamp(6);
  }
</style>

<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import { AppPath } from "../../constants/routes.constants";
  import type { SnsSummary, SnsSwapCommitment } from "../../types/sns";

  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import type { SnsFullProject } from "../../stores/projects.store";
  import { secondsToDuration } from "../../utils/date.utils";
  import Icp from "../ic/ICP.svelte";
  import Card from "../ui/Card.svelte";
  import Logo from "../ui/Logo.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { nowInSeconds } from "../../utils/neuron.utils";

  export let project: SnsFullProject;

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined;
  $: ({ summary, swapCommitment } = project);

  let logo: string;
  let name: string;
  let description: string;
  let swapDeadline: bigint;
  $: ({ logo, name, description, swapDeadline } = summary);
  let title: string;
  $: title = `${$i18n.sns_project.project} ${name}`;

  let durationTillDeadline: bigint;
  $: durationTillDeadline = swapDeadline - BigInt(nowInSeconds());

  let myCommitment: ICP | undefined;
  $: myCommitment =
    project.swapCommitment?.myCommitment === undefined
      ? undefined
      : project.swapCommitment.myCommitment === undefined
      ? undefined
      : ICP.fromE8s(project.swapCommitment.myCommitment);

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

  <p>{description}</p>

  <dl>
    <dt class="label">{$i18n.sns_project.deadline}</dt>
    <dd>{secondsToDuration(durationTillDeadline)}</dd>
    {#if myCommitment !== undefined}
      <dt class="label">{$i18n.sns_project.your_commitment}</dt>
      <dd><Icp icp={myCommitment} singleLine inheritSize /></dd>
    {/if}
  </dl>

  <!-- TODO L2-751: handle fetching errors -->
  {#if swapCommitment === undefined}
    <div class="spinner">
      <Spinner size="small" inline />
    </div>
  {/if}
</Card>

<style lang="scss">
  .title {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;
    margin-bottom: var(--padding);

    h3 {
      margin: 0;
      line-height: var(--line-height-standard);
    }
  }

  p {
    margin: 0 0 var(--padding-1_5x);
  }

  dl {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--padding-1_5x);

    dd {
      text-align: right;
    }
  }

  .spinner {
    margin-top: var(--padding-1_5x);
  }
</style>

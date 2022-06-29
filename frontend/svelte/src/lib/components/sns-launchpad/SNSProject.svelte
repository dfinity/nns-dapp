<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsSummary, SnsSwapState } from "../../services/sns.mock";

  import { i18n } from "../../stores/i18n";
  import type { SnsFullProject } from "../../stores/snsProjects.store";
  import { secondsToDuration } from "../../utils/date.utils";
  import Icp from "../ic/ICP.svelte";
  import Card from "../ui/Card.svelte";
  import Spinner from "../ui/Spinner.svelte";

  export let project: SnsFullProject;

  let summary: SnsSummary;
  let swapState: SnsSwapState | undefined;
  $: ({ summary, swapState } = project);

  let logo: string;
  let name: string;
  let description: string;
  let deadline: bigint;
  $: ({ logo, name, description, deadline } = summary);
  let title: string;
  $: title = `${$i18n.sns_project.project} ${name}`;

  let durationTillDeadline: bigint;
  $: durationTillDeadline = deadline - BigInt(Math.round(Date.now() / 1000));

  let myCommitment: ICP | undefined;
  $: myCommitment =
    project.swapState?.myCommitment === undefined
      ? undefined
      : project.swapState.myCommitment === undefined
      ? undefined
      : ICP.fromE8s(project.swapState.myCommitment);
</script>

<Card role="link">
  <div slot="start">
    <img src={logo} alt="project logo" />
    <h2>{title}</h2>
  </div>
  <p>{description}</p>
  <dl>
    <dt>{$i18n.sns_project.deadline}</dt>
    <dd>{secondsToDuration(durationTillDeadline)}</dd>
    {#if myCommitment !== undefined}
      <dt>{$i18n.sns_project.your_commitment}</dt>
      <dd><Icp icp={myCommitment} singleLine inheritSize /></dd>
    {/if}
  </dl>

  <!-- TODO L2-751: handle fetching errors -->
  {#if swapState === undefined}
    <Spinner size="small" inline />
  {/if}
</Card>

<style lang="scss">
  div {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;
    margin-bottom: var(--padding);

    h2 {
      margin: 0;
      line-height: var(--line-height-standard);
    }
  }

  img {
    width: var(--padding-3x);
    height: var(--padding-3x);
    border-radius: var(--border-radius);
    border: 2px solid var(--background-contrast);
  }

  p {
    margin-top: 0;
  }

  dl {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--padding);

    dd {
      text-align: right;
    }
  }
</style>

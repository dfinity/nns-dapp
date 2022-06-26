<script lang="ts">
  import { ICP } from "@dfinity/nns";

  import { i18n } from "../../stores/i18n";
  import type { SnsFullProject } from "../../stores/snsProjects.store";
  import Icp from "../ic/ICP.svelte";
  import Card from "../ui/Card.svelte";

  export let project: SnsFullProject;

  let logo: string;
  let name: string;
  let description: string;
  let deadline: bigint;
  $: ({ logo, name, description, deadline } = project.summary);
  let title: string;
  $: title = `${$i18n.sns_project.project} ${name}`;

  let myCommitment: ICP | undefined;
  $: myCommitment =
    project.swapState?.myCommitment === undefined
      ? undefined
      : project.swapState.myCommitment === 0n
      ? undefined
      : ICP.fromE8s(project.swapState.myCommitment);
</script>

<Card role="link">
  <div slot="start">
    <img src={logo} alt="project logo" />
    <h3>{title}</h3>
  </div>
  <p>{description}</p>
  <dl>
    <dt>{$i18n.sns_project.deadline}</dt>
    <!-- TODO: replace with readable format -->
    <dd>{new Date(Number(deadline) * 1000).toJSON()}</dd>
    {#if myCommitment !== undefined}
      <dt>{$i18n.sns_project.your_commitment}</dt>
      <dd><Icp icp={myCommitment} singleLine /></dd>
    {/if}
  </dl>
</Card>

<style lang="scss">
  div {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;

    h3 {
      margin: 0;
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

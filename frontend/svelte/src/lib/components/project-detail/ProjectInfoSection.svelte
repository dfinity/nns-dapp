<script lang="ts">
  import type { SnsSummary } from "../../types/sns";
  import { i18n } from "../../stores/i18n";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import ProjectSwapDetails from "./ProjectSwapDetails.svelte";
  import Logo from "../ui/Logo.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary;
  // type safety validation is done in ProjectDetail component
  $: summary = $projectDetailStore.summary as SnsSummary;
</script>

<div data-tid="sns-project-detail-info">
  <div class="title">
    <Logo src={summary.logo} alt={$i18n.sns_launchpad.project_logo} />
    <h1>{summary.name}</h1>
  </div>
  <p class="description">
    {summary.description}
  </p>
  <a href={summary.url} target="_blank">{summary.url}</a>
  <div class="details">
    <KeyValuePair>
      <span class="label" slot="key">{$i18n.sns_project_detail.token_name}</span
      >
      <span slot="value">{summary.tokenName}</span>
    </KeyValuePair>
    <KeyValuePair>
      <span class="label" slot="key"
        >{$i18n.sns_project_detail.token_symbol}</span
      >
      <span slot="value">{summary.symbol}</span>
    </KeyValuePair>

    <ProjectSwapDetails />
  </div>
</div>

<style lang="scss">
  .title {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;
    margin-bottom: var(--padding);

    h1 {
      margin: 0;
      line-height: var(--line-height-standard);
    }
  }
  a {
    // TODO: change <a /> global styling?
    font-size: 1rem;
  }

  .details {
    margin-top: var(--padding-2x);

    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>

<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsSummary } from "../../services/sns.mock";
  import { i18n } from "../../stores/i18n";
  import Icp from "../ic/ICP.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";

  export let summary: SnsSummary;

  const minCommitmentIcp = ICP.fromE8s(summary.minCommitment);
  const maxCommitmentIcp = ICP.fromE8s(summary.maxCommitment);
</script>

<div data-tid="sns-project-detail-info">
  <h1>{summary.name}</h1>
  <p>
    {summary.description}
  </p>
  <a href={summary.url} target="_blank">{summary.url}</a>
  <div class="details">
    <KeyValuePair>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.token_name}</svelte:fragment
      >
      <span slot="value">{summary.tokenName}</span>
    </KeyValuePair>
    <KeyValuePair>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.token_symbol}</svelte:fragment
      >
      <span slot="value">{summary.symbol}</span>
    </KeyValuePair>
    <!-- TODO: Expandable Component -->
    <KeyValuePair info>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.min_commitment}</svelte:fragment
      >
      <svelte:fragment slot="value">
        <Icp icp={minCommitmentIcp} singleLine />
      </svelte:fragment>
    </KeyValuePair>
    <!-- TODO: Expandable Component -->
    <KeyValuePair info>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.max_commitment}</svelte:fragment
      >
      <svelte:fragment slot="value"
        ><Icp icp={maxCommitmentIcp} singleLine /></svelte:fragment
      >
    </KeyValuePair>
  </div>
</div>

<style lang="scss">
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

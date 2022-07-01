<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsSummary } from "../../services/sns.mock";
  import { i18n } from "../../stores/i18n";
  import Icp from "../ic/ICP.svelte";
  import Collapsible from "../ui/Collapsible.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import Logo from "../ui/Logo.svelte";

  export let summary: SnsSummary;

  const minCommitmentIcp = ICP.fromE8s(summary.minCommitment);
  const maxCommitmentIcp = ICP.fromE8s(summary.maxCommitment);
</script>

<div data-tid="sns-project-detail-info">
  <div class="title">
    <Logo src={summary.logo} alt={$i18n.sns_launchpad.project_logo} />
    <h1>{summary.name}</h1>
  </div>
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
    <div>
      <Collapsible iconSize="none">
        <KeyValuePair info slot="header">
          <svelte:fragment slot="key"
            >{$i18n.sns_project_detail.min_commitment}</svelte:fragment
          >
          <svelte:fragment slot="value">
            <Icp icp={minCommitmentIcp} singleLine />
          </svelte:fragment>
        </KeyValuePair>
        <p class="small">
          This is the text that is hidden and should appear on click
        </p>
      </Collapsible>
    </div>
    <div>
      <Collapsible iconSize="none">
        <KeyValuePair info slot="header">
          <svelte:fragment slot="key"
            >{$i18n.sns_project_detail.max_commitment}</svelte:fragment
          >
          <svelte:fragment slot="value"
            ><Icp icp={maxCommitmentIcp} singleLine /></svelte:fragment
          >
        </KeyValuePair>
        <p class="small">
          This should be an explanation of what does maximum commitment means
        </p>
      </Collapsible>
    </div>
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

  .small {
    font-size: var(--font-size-small);
  }
</style>

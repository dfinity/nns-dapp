<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Icp from "../ic/ICP.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";

  const mockIcp1 = ICP.fromString("5") as ICP;
  const mockIcp2 = ICP.fromString("50") as ICP;
</script>

<div data-tid="sns-project-detail-info">
  <h1>Project Tetris</h1>
  <p>
    Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    eiusmod tempor
  </p>
  <a href="https://6hsbt-vqaaa-aaaaf-aaafq-cai.ic0.app/"
    >http://linkToValuePropositionExternal</a
  >
  <div class="details">
    <KeyValuePair>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.token_name}</svelte:fragment
      >
      <span slot="value">Tetris Token</span>
    </KeyValuePair>
    <KeyValuePair>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.token_symbol}</svelte:fragment
      >
      <span slot="value">TET</span>
    </KeyValuePair>
    <!-- TODO: Expandable Component -->
    <KeyValuePair info>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.min_commitment}</svelte:fragment
      >
      <svelte:fragment slot="value">
        <Icp icp={mockIcp1} singleLine />
      </svelte:fragment>
    </KeyValuePair>
    <!-- TODO: Expandable Component -->
    <KeyValuePair info>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.max_commitment}</svelte:fragment
      >
      <svelte:fragment slot="value"
        ><Icp icp={mockIcp2} singleLine /></svelte:fragment
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

<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Icp from "../ic/ICP.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";

  const mockIcp1 = ICP.fromString("5") as ICP;
  const mockIcp2 = ICP.fromString("50") as ICP;
</script>

<div>
  <h1 data-tid="sns-project-detail-title">Project Tetris</h1>
  <p>
    Tagline – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    eiusmod tempor
  </p>
  <a
    data-tid="sns-project-detail-link"
    href="https://6hsbt-vqaaa-aaaaf-aaafq-cai.ic0.app/"
    >http://linkToValuePropositionExternal</a
  >
  <div class="details">
    <KeyValuePair>
      <p slot="key">{$i18n.sns_project_detail.token_name}</p>
      <p slot="value" class="contrast">Tetris Token</p>
    </KeyValuePair>
    <KeyValuePair>
      <p slot="key">{$i18n.sns_project_detail.token_symbol}</p>
      <p slot="value" class="contrast">TET</p>
    </KeyValuePair>
    <KeyValuePair info>
      <p slot="key">{$i18n.sns_project_detail.min_commitment}</p>
      <div slot="value">
        <Icp icp={mockIcp1} inline />
      </div>
      <p>
        Info – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        eiusmod tempor
      </p>
    </KeyValuePair>
    <KeyValuePair info>
      <p slot="key">{$i18n.sns_project_detail.max_commitment}</p>
      <p slot="value"><Icp icp={mockIcp2} inline /></p>
      <p>
        Info – Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        eiusmod tempor
      </p>
    </KeyValuePair>
  </div>
</div>

<style lang="scss">
  a {
    // TODO: change <a /> global styling?
    font-size: 1rem;
  }

  .details {
    margin-top: var(--padding);
  }

  .contrast {
    color: var(--gray-50);
  }
</style>

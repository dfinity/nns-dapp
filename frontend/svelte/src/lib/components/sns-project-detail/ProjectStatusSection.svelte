<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import Icp from "../ic/ICP.svelte";
  import Badge from "../ui/Badge.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import ProgressBar from "../ui/ProgressBar.svelte";

  const mockIcp1 = ICP.fromString("1327") as ICP;
  const mockIcp2 = ICP.fromString("20") as ICP;
</script>

<div class="wrapper" data-tid="sns-project-detail-status">
  <div class="title">
    <h2>{$i18n.sns_project_detail.status}</h2>
    <!-- TODO: Create another Badge for SNS? -->
    <Badge>{$i18n.sns_project_detail.accepting}</Badge>
  </div>
  <div class="content">
    <KeyValuePair info testId="sns-project-current-commitment">
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.current_commitment}</svelte:fragment
      >
      <svelte:fragment slot="value">
        <Icp icp={mockIcp1} singleLine />
      </svelte:fragment>
    </KeyValuePair>
    <div data-tid="sns-project-commitment-progress">
      <ProgressBar value={1327} max={3000}>
        <p slot="top" class="right">
          {$i18n.sns_project_detail.max_commitment}
        </p>
        <p slot="bottom">
          {$i18n.sns_project_detail.min_commitment_goal}
        </p>
      </ProgressBar>
    </div>
    <div>
      <ProgressBar value={85} max={100}>
        <p slot="top" class="push-apart">
          <span>
            {$i18n.sns_project_detail.deadline}
          </span>
          <span>
            {secondsToDuration(BigInt(3600 * 24 * 14 + 3600 * 4))}
          </span>
        </p>
      </ProgressBar>
    </div>
  </div>
  <div class="actions">
    <div>
      <KeyValuePair>
        <svelte:fragment slot="key"
          >{$i18n.sns_project_detail.user_commitment}</svelte:fragment
        >
        <svelte:fragment slot="value">
          <Icp icp={mockIcp2} singleLine />
        </svelte:fragment>
      </KeyValuePair>
    </div>
    <button class="primary small" data-tid="sns-project-participate-button"
      >{$i18n.sns_project_detail.participate}</button
    >
  </div>
</div>

<style lang="scss">
  @use "../../themes/mixins/media";
  p {
    margin: 0;
  }

  .wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
  .right {
    text-align: right;
  }

  .push-apart {
    display: flex;
    justify-content: space-between;
  }

  .actions {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-end;
    gap: var(--padding-2x);

    flex: 1;

    @include media.min-width(medium) {
      align-items: flex-start;

      flex: initial;
    }
  }
</style>

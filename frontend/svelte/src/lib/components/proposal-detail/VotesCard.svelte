<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import Card from "../ui/Card.svelte";
  import { i18n } from "../../stores/i18n";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { formatNumber } from "../../utils/format.utils";

  export let proposalInfo: ProposalInfo;

  if (!proposalInfo) throw new Error("no proposalInfo provided");

  const { yes, no } = proposalInfo.latestTally;
  const yesValue = Number(yes) / E8S_PER_ICP;
  const noValue = Number(no) / E8S_PER_ICP;
  const summ = yesValue + noValue;
</script>

<!-- TODO: Adop/Reject card content -- https://dfinity.atlassian.net/browse/L2-269 -->
<Card>
  <div class="latest-tally">
    <h3>
      {$i18n.proposal_detail.adopt}<span>{formatNumber(yesValue)}</span>
    </h3>
    <div
      class="progressbar"
      role="progressbar"
      aria-valuenow={yesValue}
      aria-valuemin={0}
      aria-valuemax={summ}
    >
      <div
        class="progressbar-value"
        style="width: {(yesValue / summ) * 100}%"
      />
    </div>
    <h3>
      {$i18n.proposal_detail.reject}<span>{formatNumber(noValue)}</span>
    </h3>
  </div>

  <h2>My Votes (TBD)</h2>
  <!-- TODO: implement MyVotesBlock https://dfinity.atlassian.net/browse/L2-283 -->
  MyVotesCard
</Card>

<style lang="scss">
  @use "../../themes/mixins/media";

  .latest-tally {
    display: grid;

    grid-template-columns: 110px 1fr 110px;
    align-items: center;
    height: var(--headless-layout-header-height);

    @include media.min-width(medium) {
      grid-template-columns: 130px 1fr 130px;
    }

    h3 {
      font-size: var(--font-size-h4);
      line-height: var(--line-height-standard);
      text-align: center;

      @include media.min-width(medium) {
        font-size: var(--font-size-h3);
      }

      span {
        display: block;
        text-align: center;
        font-size: var(--font-size-small);

        @include media.min-width(medium) {
          font-size: var(--font-size-h5);
        }
      }
    }

    .progressbar {
      position: relative;
      height: 10px;
      background: var(--pink);

      .progressbar-value {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;

        background: var(--blue-200-shade);
      }
    }
  }
</style>

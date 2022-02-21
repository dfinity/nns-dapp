<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import Card from "../ui/Card.svelte";
  import { formatICP } from "../../../lib/utils/icp.utils";
  import { i18n } from "../../stores/i18n";

  export let proposalInfo: ProposalInfo;

  $: latestTallyYes = proposalInfo.latestTally.yes;
  $: latestTallyNo = proposalInfo.latestTally.no;
</script>

<!-- TODO: Adop/Reject card content -- https://dfinity.atlassian.net/browse/L2-269 -->
<Card>
  <div class="latest-tally">
    <h3>
      {$i18n.proposal_detail.adopt}<span
        >{`${formatICP({
          value: latestTallyYes,
          minFraction: 2,
          maxFraction: 2,
        })}`}</span
      >
    </h3>
    <div
      class="progressbar"
      role="progressbar"
      aria-valuenow={Number(latestTallyYes)}
      aria-valuemin={0}
      aria-valuemax={Number(latestTallyYes + latestTallyNo)}
    >
      <div
        class="progressbar-value"
        style="width: {(Number(latestTallyYes) /
          Number(latestTallyYes + latestTallyNo)) *
          100}%"
      />
    </div>
    <h3>
      {$i18n.proposal_detail.reject}<span
        >{`${formatICP({
          value: latestTallyNo,
          minFraction: 2,
          maxFraction: 2,
        })}`}</span
      >
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

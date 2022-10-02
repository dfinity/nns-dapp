<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import CardInfo from "../ui/CardInfo.svelte";
  import { i18n } from "../../stores/i18n";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { formatNumber } from "../../utils/format.utils";
  import type { SvelteComponent } from "svelte";
  import { VOTING_UI } from "../../constants/environment.constants";
  import ContentCell from "../ui/ContentCell.svelte";

  export let proposalInfo: ProposalInfo;

  let yes: number;
  let no: number;
  let sum: number;

  $: yes = Number(proposalInfo?.latestTally?.yes ?? 0) / E8S_PER_ICP;
  $: no = Number(proposalInfo?.latestTally?.no ?? 0) / E8S_PER_ICP;
  $: sum = yes + no;

  // TODO(L2-965): delete legacy component <CardInfo />, inline styles (.content-cell-title and .content-cell-details) and delete ContentCell
  let cmp: typeof SvelteComponent =
    VOTING_UI === "legacy" ? CardInfo : ContentCell;
</script>

<svelte:component this={cmp}>
  <h2 slot="start" class="title">{$i18n.proposal_detail.voting_results}</h2>
  <div class="latest-tally">
    <h4 class="label yes">
      {$i18n.proposal_detail.adopt}<span>{formatNumber(yes)}</span>
    </h4>
    <div
      class="progressbar"
      role="progressbar"
      aria-label={$i18n.proposal_detail__vote.vote_progress}
      aria-valuenow={yes}
      aria-valuemin={0}
      aria-valuemax={sum}
    >
      <div class="progressbar-value" style="width: {(yes / sum) * 100}%" />
    </div>
    <h4 class="label no">
      {$i18n.proposal_detail.reject}<span>{formatNumber(no)}</span>
    </h4>
  </div>
</svelte:component>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .latest-tally {
    display: grid;

    grid-template-columns: 110px 1fr 110px;
    align-items: center;
    height: var(--header-height);

    @include media.min-width(medium) {
      grid-template-columns: 130px 1fr 130px;
    }

    h4 {
      line-height: var(--line-height-standard);
      text-align: center;

      &.yes {
        color: var(--positive-emphasis);
      }

      &.no {
        color: var(--negative-emphasis);
      }

      span {
        display: block;
        text-align: center;
        font-size: var(--font-size-small);
        font-weight: initial;

        @include media.min-width(medium) {
          font-size: var(--font-size-h5);
        }
      }
    }

    .progressbar {
      position: relative;
      height: 10px;
      background: var(--negative-emphasis);

      border-radius: var(--border-radius);
      overflow: hidden;

      .progressbar-value {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;

        // TODO(L2-931): delete legacy style
        --positive-emphasis-gradient: linear-gradient(
          99.27deg,
          var(--positive-emphasis) -0.11%,
          #026500 100.63%
        );
        --positive-emphasis-gradient-fallback: var(--positive-emphasis);
        --positive-emphasis-gradient-contrast: var(
          --positive-emphasis-contrast
        );

        background: var(--positive-emphasis-gradient-fallback);
        background: var(--positive-emphasis-gradient);
      }
    }
  }

  .title {
    padding-bottom: var(--padding);
  }
</style>

<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { formatNumber } from "../../utils/format.utils";

  export let proposalInfo: ProposalInfo;

  let yes: number;
  let no: number;
  let sum: number;

  $: yes = Number(proposalInfo?.latestTally?.yes ?? 0) / E8S_PER_ICP;
  $: no = Number(proposalInfo?.latestTally?.no ?? 0) / E8S_PER_ICP;
  $: sum = yes + no;
</script>

<div class="latest-tally">
  <p>
    <span>{$i18n.proposal_detail.adopt}</span><span class="value"
      >{formatNumber(yes)}</span
    >
  </p>
  <div
    class="progressbar"
    role="progressbar"
    aria-valuenow={yes}
    aria-valuemin={0}
    aria-valuemax={sum}
  >
    <div class="progressbar-value" style="width: {(yes / sum) * 100}%" />
  </div>
  <p>
    <span>{$i18n.proposal_detail.reject}</span><span class="value"
      >{formatNumber(no)}</span
    >
  </p>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .latest-tally {
    display: grid;

    grid-template-columns: auto 1fr auto;
    gap: var(--padding-3x);
    align-items: center;

    p {
      margin: 0;
      line-height: var(--line-height-standard);
      text-align: center;
      font-weight: normal;
      font-size: var(--font-size-small);

      .value {
        display: block;

        text-align: center;
        font-weight: initial;
      }
    }

    .progressbar {
      position: relative;
      height: var(--padding-1_5x);
      background: var(--negative-emphasis-light);

      border-radius: var(--padding);
      overflow: hidden;

      .progressbar-value {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;

        background: var(--primary-gradient-fallback);
        background: var(--primary-gradient);
      }
    }
  }
</style>

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";

  type Props = {
    yes: number;
    no: number;
    total: number;
  };

  const { yes, no, total }: Props = $props();

  const yesProportion: number = $derived(total ? yes / total : 0);
  const noProportion: number = $derived(total ? no / total : 0);
</script>

<div class="votes-info">
  <div class="yes yes-percent">
    <span class="caption">{$i18n.portfolio.new_sns_proposal_card_adopt}</span>
    <span class="percentage" data-tid="adopt-percentage"
      >{formatPercentage(yesProportion, {
        minFraction: 2,
        maxFraction: 2,
      })}</span
    >
  </div>
  <div class="no no-percent">
    <span class="caption">{$i18n.portfolio.new_sns_proposal_card_reject}</span>
    <span class="percentage" data-tid="reject-percentage"
      >{formatPercentage(noProportion)}</span
    >
  </div>
  <div class="progressbar-container">
    <div
      class="progressbar"
      role="progressbar"
      data-tid="votes-progressbar"
      aria-label={$i18n.proposal_detail__vote.vote_progress}
      aria-valuenow={yes}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div class="yes" style={`width: ${yesProportion * 100}%`}></div>
      <div class="no" style={`width: ${noProportion * 100}%`}></div>
    </div>
    <div class="center-marker" aria-hidden="true"></div>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .votes-info {
    display: grid;
    margin: var(--padding-2) 0;

    grid-template-areas:
      "yes-percent no-percent"
      "progressbar progressbar";
    grid-template-columns: 1fr 1fr;

    row-gap: var(--padding-0_5x);

    .yes-percent {
      grid-area: yes-percent;
      display: flex;
      flex-direction: column;
      align-items: start;
    }
    .no-percent {
      grid-area: no-percent;
      display: flex;
      flex-direction: column;
      align-items: end;
    }

    .progressbar-container {
      grid-area: progressbar;
      position: relative;
    }

    .percentage {
      @include fonts.h2(true);
    }

    .caption {
      @include fonts.small;
    }

    .yes .percentage {
      color: var(--positive-emphasis);
    }
    .no .percentage {
      color: var(--negative-emphasis);
    }
  }

  .progressbar-container .majority {
    position: absolute;
    background: var(--card-background);
    width: calc(var(--padding) / 4);
    height: var(--padding-1_5x);

    .majority-icon {
      position: absolute;
      top: calc(-1 * var(--padding-1_5x));
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .progressbar {
    display: flex;
    justify-content: space-between;
    height: var(--padding);
    border-radius: var(--border-radius);
    overflow: hidden;
    background: var(--elements-divider);

    .yes {
      background: var(--positive-emphasis);
      transition: width ease-out var(--animation-time-normal);
    }
    .no {
      background: var(--negative-emphasis);
      transition: width ease-out var(--animation-time-normal);
    }
  }

  .center-marker {
    position: absolute;
    top: 0;
    left: 50%;
    width: 3px;
    height: var(--padding);
    background-color: var(--card-background);
    transform: translateX(-50%);
    z-index: 1;
  }
</style>

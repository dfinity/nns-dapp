<script lang="ts">
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { ProgressBar } from "@dfinity/gix-components";
  import { maxNeuronFundCommitmentE8s } from "$lib/utils/sns-swap.utils";

  export let maxDirectParticipationE8s: bigint;
  export let nfCommitmentE8s: bigint;

  let max: bigint;
  $: max = maxNeuronFundCommitmentE8s(maxDirectParticipationE8s);
</script>

<ProgressBar
  max={Number(max)}
  value={Number(nfCommitmentE8s)}
  testId="nf-commitment-progress-bar-component"
  color="warning"
>
  <div class="info" slot="bottom">
    <div class="value-labels">
      <p class="value-label value-label-min">
        <span>
          {$i18n.sns_project_detail.min_nf_commitment_goal}
        </span>
        <span data-tid="commitment-min-indicator-value">
          <AmountDisplay
            amount={TokenAmount.fromE8s({
              amount: 0n,
              token: ICPToken,
            })}
            singleLine
          />
        </span>
      </p>
      <p class="value-label value-label-max">
        <span>
          {$i18n.sns_project_detail.max_nf_commitment_goal}
        </span>
        <span data-tid="commitment-max-indicator-value">
          <AmountDisplay
            amount={TokenAmount.fromE8s({ amount: max, token: ICPToken })}
            singleLine
          />
        </span>
      </p>
    </div>
  </div>
</ProgressBar>

<style lang="scss">
  p {
    margin: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .value-labels {
    display: flex;
    justify-content: space-between;

    --progress-bar-background: var(--warning-emphasis);
    --label-color: var(--description-color);
    --amount-color: var(--description-color);
    margin-top: var(--padding-0_5x);
  }

  .value-label {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
    font-size: var(--font-size-small);
  }

  .value-label-min {
    align-items: flex-start;
    color: var(--description-color);
    font-size: var(--font-size-small);
  }

  .value-label-max {
    align-items: flex-end;
    font-size: var(--font-size-small);
    color: var(--description-color);
    text-align: end;
  }
</style>

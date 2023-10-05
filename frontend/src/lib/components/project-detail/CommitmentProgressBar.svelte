<script lang="ts">
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { ProgressBar } from "@dfinity/gix-components";

  export let max: bigint;
  export let participationE8s: bigint;
  export let minimumIndicator: bigint | undefined = undefined;
  export let color: "warning" | "primary";

  let width: number | undefined;
  let minIndicatorPosition: number | undefined;
  $: minIndicatorPosition =
    minimumIndicator !== undefined && width !== undefined
      ? (Number(minimumIndicator) / Number(max)) * width
      : undefined;
</script>

<ProgressBar
  max={Number(max)}
  value={Number(participationE8s)}
  {color}
  testId="commitment-progress-bar-component"
>
  <div class="info" bind:clientWidth={width} slot="bottom">
    {#if minimumIndicator !== undefined}
      <div class="indicator-wrapper">
        <span
          class="min-indicator"
          data-tid="commitment-min-indicator"
          style={`left: calc(${minIndicatorPosition}px);`}
        />
      </div>
      <div class="value-labels">
        <p class="value-label value-label-min">
          <span>
            {$i18n.sns_project_detail.min_commitment_goal}
          </span>
          <span data-tid="commitment-min-indicator-value">
            <AmountDisplay
              amount={TokenAmount.fromE8s({
                amount: minimumIndicator,
                token: ICPToken,
              })}
              singleLine
            />
          </span>
        </p>
        <p class="value-label value-label-max">
          <span>
            {$i18n.sns_project_detail.max_commitment_goal}
          </span>
          <span data-tid="commitment-max-indicator-value">
            <AmountDisplay
              amount={TokenAmount.fromE8s({ amount: max, token: ICPToken })}
              singleLine
            />
          </span>
        </p>
      </div>
    {/if}
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

  .indicator-wrapper {
    height: var(--padding-2x);

    position: relative;
    // Position the indicator above the progress bar.
    margin-top: calc(-1 * var(--padding-1_5x));
  }

  .min-indicator {
    position: absolute;
    display: block;

    width: 1px;
    height: var(--padding-1_5x);

    background-color: var(--positive-emphasis);
  }

  .value-labels {
    display: flex;
    justify-content: space-between;
  }

  .value-label {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);

    font-size: var(--font-size-small);
  }

  .value-label-min {
    align-items: flex-start;

    color: var(--positive-emphasis);
    --amount-color: var(--positive-emphasis);
    --label-color: var(--positive-emphasis);
  }

  .value-label-max {
    align-items: flex-end;
    text-align: right;

    color: var(--description-color);
    --amount-color: var(--description-color);
    --label-color: var(--description-color);
  }
</style>

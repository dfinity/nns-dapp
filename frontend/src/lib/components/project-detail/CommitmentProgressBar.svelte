<script lang="ts">
  import {
    TokenAmount,
    ICPToken,
    nonNullish,
    TokenAmountV2,
  } from "@dfinity/utils";
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

  // Triangle base is 12px, the middle is half that.
  // But we want it aligned with the line below, that has width of 2px.
  const triangleleftOffset = "(12px / 2) + (2px / 2)";
</script>

<ProgressBar
  max={Number(max)}
  value={Number(participationE8s)}
  {color}
  testId="commitment-progress-bar-component"
>
  <svelte:fragment slot="top">
    {#if nonNullish(minIndicatorPosition)}
      <div class="indicator-wrapper">
        <div
          class="triangle"
          style={`left: calc(${minIndicatorPosition}px - ${triangleleftOffset});`}
        ></div>
        <div class="indicator-line-wrapper">
          <span
            class="min-indicator"
            data-tid="commitment-min-indicator"
            style={`left: calc(${minIndicatorPosition}px);`}
          />
        </div>
      </div>
    {/if}
  </svelte:fragment>
  <div class="info" bind:clientWidth={width} slot="bottom">
    {#if minimumIndicator !== undefined}
      <div class="value-labels">
        <p class="value-label value-label-min">
          <span>
            {$i18n.sns_project_detail.min_commitment_goal}
          </span>
          <span data-tid="commitment-min-indicator-value">
            <AmountDisplay
              amount={TokenAmountV2.fromUlps({
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
              amount={TokenAmountV2.fromUlps({ amount: max, token: ICPToken })}
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
    --line-width: 2px;
    --triangle-size: 6px;

    .triangle {
      position: relative;
      --triangle-sides-border: var(--triangle-size) solid transparent;
      display: block;
      width: 0;
      height: 0;
      border-left: var(--triangle-sides-border);
      border-right: var(--triangle-sides-border);
      border-top: var(--triangle-size) solid var(--primary);

      top: calc(-1 * var(--padding-0_5x));
    }

    .indicator-line-wrapper {
      position: relative;
      // Position the indicator above the progress bar.
      margin-bottom: calc(-1 * var(--padding-1x));
    }
  }

  .min-indicator {
    position: absolute;
    display: block;

    width: var(--line-width);
    height: var(--padding-1_5x);

    background-color: var(--primary);
  }

  .value-labels {
    display: flex;
    justify-content: space-between;

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

    color: var(--primary);
    --amount-color: var(--primary);
    --label-color: var(--primary);
  }

  .value-label-max {
    align-items: flex-end;
    text-align: right;

    color: var(--description-color);
    --amount-color: var(--description-color);
    --label-color: var(--description-color);
  }
</style>

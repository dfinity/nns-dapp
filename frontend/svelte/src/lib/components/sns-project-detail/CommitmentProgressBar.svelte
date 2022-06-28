<script lang="ts">
  import { ICP } from "@dfinity/nns";

  import { i18n } from "../../stores/i18n";
  import Icp from "../ic/ICP.svelte";
  import ProgressBar from "../ui/ProgressBar.svelte";

  export let max: bigint;
  export let value: bigint;
  export let minimumIndicator: bigint | undefined = undefined;

  let width: number | undefined;
  let minIndicatorPosition: number | undefined;
  $: minIndicatorPosition =
    minimumIndicator !== undefined && width !== undefined
      ? (Number(minimumIndicator) / Number(max)) * width
      : undefined;
</script>

<div>
  <ProgressBar max={Number(max)} value={Number(value)} color="yellow">
    <div class="info" slot="top">
      <p class="right">
        {$i18n.sns_project_detail.max_commitment}
      </p>
      <div class="indicator-wrapper">
        <span
          class="max-indicator triangle down"
          data-tid="commitment-max-indicator"
        />
      </div>
    </div>
    <div class="info" bind:clientWidth={width} slot="bottom">
      {#if minimumIndicator !== undefined}
        <div class="indicator-wrapper">
          <span
            class="min-indicator triangle up"
            data-tid="commitment-min-indicator"
            style={`left: ${minIndicatorPosition}px;`}
          />
        </div>
        <p>
          <span>
            {$i18n.sns_project_detail.min_commitment_goal}
          </span>
          <!-- TODO: Move with indicator https://dfinity.atlassian.net/browse/L2-768 -->
          <span>
            <Icp icp={ICP.fromE8s(minimumIndicator)} singleLine />
          </span>
        </p>
      {/if}
    </div>
  </ProgressBar>
</div>

<style lang="scss">
  p {
    margin: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .right {
    text-align: right;
  }

  .indicator-wrapper {
    height: 12px;

    position: relative;
  }

  .triangle {
    --triangle-side: 8px solid transparent;

    display: block;

    width: 0;
    height: 0;
    border-left: var(--triangle-side);
    border-right: var(--triangle-side);

    &.up {
      // Borders do not support gradients
      border-bottom: 12px solid var(--yellow-400);
    }

    &.down {
      // Borders do not support gradients
      border-top: 12px solid var(--header-background-fallback);
    }
  }

  .max-indicator {
    position: absolute;
    right: 0;
  }

  .min-indicator {
    position: absolute;
    left: 0;
  }
</style>

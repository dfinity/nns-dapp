<script lang="ts">
  import IconLockClock from "../../icons/IconLockClock.svelte";
  import Card from "../Card.svelte";
</script>

<Card to="/#/neurons/one">
  <div slot="start">
    <h4>14225061177570733325</h4>
    <p class="lock">
      <span class="lock-text white">Locked</span>
      <IconLockClock size="s" />
    </p>
  </div>

  <div slot="end" class="align-right">
    <h3 class="amount">2.00</h3>
    <span class="currency">ICP</span>
    <p class="stake">Stake</p>
  </div>

  <p class="duration">3 Years, 64 Days Dissolve Delay</p>
</Card>

<style lang="scss">
  h4, h3 {
    line-height: 1.3;
  }

  p {
    margin: 0;
  }

  .lock {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .lock-text {
    font-size: 1.1rem;
  }

  .white {
    color: var(--background-contrast);
  }

  .align-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .duration {
    font-size: 1.1rem;
  }

  .amount {
    margin-bottom: 0;
  }

  .stake {
    font-size: 1.1rem;
    margin-top: 5px;
  }

  .currency {
    font-size: 0.6rem;
  }
</style>

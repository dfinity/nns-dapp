<script lang="ts">
  import IconLockClock from "../../icons/IconLockClock.svelte";
  import Card from "../Card.svelte";

  const goToDetail = () => {
    // Go to the detail page of Neuron
  };
</script>

<!-- TODO https://dfinity.atlassian.net/browse/L2-218 -->
<Card role="link" on:click={goToDetail}>
  <div slot="start" class="lock">
    <h4>14225061177570733325</h4>
    <p class="lock">
      <span class="white">Locked</span>
      <IconLockClock size="s" />
    </p>
  </div>

  <div slot="end" class="currency">
    <h3>2.00</h3>
    <span class="currency">ICP</span>
    <p class="stake">Stake</p>
  </div>

  <p class="duration">3 Years, 64 Days Dissolve Delay</p>
</Card>

<style lang="scss">
  h4,
  h3 {
    line-height: 1.3;
    margin-bottom: 0;
  }

  .lock p {
    display: flex;
    align-items: center;
    gap: 0.3rem;

    & span {
      font-size: 1.1rem;
    }
  }

  .white {
    color: var(--background-contrast);
  }

  .currency {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    & span {
      font-size: 0.6rem;
    }

    & p {
      font-size: 1.1rem;
      margin-top: 5px;
    }
  }

  .duration {
    font-size: 1.1rem;
  }
</style>

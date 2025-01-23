<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";

  export let testId: string;
</script>

<Card {testId}>
  <div class="wrapper">
    <div class="header">
      <div class="header-wrapper">
        <div class="icon skeleton" />
        <div class="text-content">
          <div class="title skeleton" />
          <div class="amount skeleton" />
        </div>
      </div>
      <div class="link skeleton" />
    </div>

    <div class="body">
      <div class="header">
        <span class="skeleton" />
        <span class="skeleton justify-end" />
        <span class="skeleton justify-end tablet-up" />
      </div>

      <div class="list">
        {#each Array(4) as _, i (i)}
          <div class="row">
            <div class="info">
              <div class="logo-skeleton skeleton" />
              <div class="title-skeleton skeleton" />
            </div>

            <div class="balance-native skeleton" />
            <div class="balance-usd skeleton" />
          </div>
        {/each}
      </div>
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .skeleton {
    background: linear-gradient(
      90deg,
      var(--card-background) 0px,
      var(--elements-divider) 50%,
      var(--card-background) 100%
    );
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--card-background-tint);

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--padding-3x) var(--padding-2x);

      .header-wrapper {
        display: flex;
        align-items: flex-start;
        gap: var(--padding-2x);

        .icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }

        .text-content {
          display: flex;
          flex-direction: column;
          gap: var(--padding-0_5x);

          .title {
            height: 20px;
            width: 120px;
            border-radius: 4px;
          }

          .amount {
            height: 42px;
            width: 100px;
            border-radius: 4px;
          }
        }
      }

      .link {
        width: 35px;
        height: 35px;
        border-radius: 50%;

        @include media.min-width(medium) {
          width: 120px;
          height: var(--button-min-height);
          border-radius: var(--border-radius);
        }
      }
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: var(--padding);
      flex-grow: 1;

      .header {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 0 var(--padding-2x);

        span {
          height: 14px;
          border-radius: 4px;
          &:first-child {
            width: 80px;
          }
          &:not(:first-child) {
            width: 60px;
          }
        }

        @include media.min-width(medium) {
          grid-template-columns: 1fr 1fr 1fr;
        }
      }

      .list {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background);
        flex-grow: 1;

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-areas:
            "info usd"
            "info balance";
          @include media.min-width(medium) {
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-areas: "info balance usd";
          }

          align-items: center;
          padding: var(--padding-3x) var(--padding-2x);
          border-top: 1px solid var(--elements-divider);

          .info {
            grid-area: info;
            display: flex;
            align-items: center;
            gap: var(--padding);

            .logo-skeleton {
              width: 36px;
              height: 36px;
              border-radius: 50%;
            }

            .title-skeleton {
              height: 16px;
              width: 100px;
              border-radius: 4px;
            }
          }

          .balance-native {
            grid-area: balance;
            justify-self: end;
            height: 16px;
            width: 80px;
            border-radius: 4px;
          }

          .balance-usd {
            grid-area: usd;
            justify-self: end;
            height: 16px;
            width: 70px;
            border-radius: 4px;
          }
        }
      }
    }

    .tablet-up {
      display: none !important;
    }

    @include media.min-width(medium) {
      .tablet-up {
        display: block !important;
      }
    }

    .justify-end {
      justify-self: end;
    }
  }
</style>

<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";

  type Props = {
    testId?: string;
    icpOnlyTable?: boolean;
  };
  const { testId, icpOnlyTable = false }: Props = $props();
</script>

<Card {testId}>
  <div class="wrapper">
    <div class="header">
      <div class="header-wrapper">
        <div class="icon skeleton"></div>
        <div class="text-content">
          <div class="title skeleton"></div>
          <div class="amount skeleton"></div>
        </div>
      </div>
      <div class="link skeleton"></div>
    </div>

    <div class="body">
      {#if icpOnlyTable}
        <div class="header">
          <span class="title skeleton"></span>
          <div class="columnheaders">
            <span class="skeleton"></span>
            <span class="skeleton"></span>
            <span class="skeleton"></span>
          </div>
        </div>
        <div class="list">
          <div class="row">
            <div class="info">
              <div class="logo-skeleton skeleton"></div>
              <div class="title-skeleton skeleton"></div>
            </div>

            <div class="balance-native skeleton"></div>
            <div class="balance-usd skeleton"></div>
          </div>
        </div>
      {:else}
        <div class="header">
          <span class="title skeleton"></span>
          <div class="columnheaders">
            <span class="skeleton"></span>
            <span class="skeleton"></span>
            <span class="skeleton"></span>
          </div>
        </div>

        <div class="list grow">
          {#each Array(3) as _}
            <div class="row">
              <div class="info">
                <div class="logo-skeleton skeleton"></div>
                <div class="title-skeleton skeleton"></div>
              </div>

              <div class="balance-native skeleton"></div>
              <div class="balance-usd skeleton"></div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--card-background-tint);

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--padding-2x);

      .header-wrapper {
        display: flex;
        align-items: flex-start;
        gap: var(--padding);

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
            height: 14px;
            width: 120px;
            border-radius: 4px;
          }

          .amount {
            height: 32px;
            width: 80px;
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
      flex-grow: 1;

      .header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: var(--padding-2x);
        padding-bottom: var(--padding);
        gap: var(--padding);
        border-top: 4px solid var(--elements-divider);

        .title {
          height: 20px;
          width: 90px;
        }

        .columnheaders {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;

          @include media.min-width(medium) {
            grid-template-columns: 1fr 1fr 1fr;
          }

          span {
            height: 16px;
            border-radius: 4px;

            &:first-child {
              width: 80px;
            }

            &:not(:first-child) {
              width: 60px;
              justify-self: flex-end;
            }

            &:last-child {
              display: none;

              @include media.min-width(medium) {
                display: block;
              }
            }
          }
        }
      }

      .list {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background);

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
          padding: var(--padding-2x);
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

      .grow {
        flex-grow: 1;
      }
    }
  }
</style>

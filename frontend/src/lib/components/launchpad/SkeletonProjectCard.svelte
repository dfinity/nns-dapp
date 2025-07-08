<script lang="ts">
  import CardFrame from "$lib/components/launchpad/CardFrame.svelte";
  import SkeletonLogo from "$lib/components/ui/SkeletonLogo.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
</script>

<CardFrame testId="skeleton-project-card-component">
  <div class="card-content">
    <div class="header">
      <SkeletonLogo />
      <div class="headline"><SkeletonText /></div>
    </div>
    <div>
      <SkeletonText />
      <SkeletonText />
    </div>
    <div class="fields">
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    </div>
  </div>
</CardFrame>

<style lang="scss">
  @use "../../themes/mixins/launchpad";

  .card-content {
    @include launchpad.card_content();

    grid-template-rows: 1fr 1fr 1fr;

    .header {
      @include launchpad.card_content_header;

      --skeleton-logo-size: 40px;

      grid-template-columns: auto 1fr;

      .headline {
        height: 18px;
        width: 100%;
      }
    }

    .fields {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: var(--padding-2x);
      height: 40px;
    }
  }
</style>

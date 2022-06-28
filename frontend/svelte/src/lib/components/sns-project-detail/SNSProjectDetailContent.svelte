<script lang="ts">
  import ProjectInfoSection from "./ProjectInfoSection.svelte";
  import ProjectStatusSection from "./ProjectStatusSection.svelte";
  import TwoColumns from "../ui/TwoColumns.svelte";
</script>

<section>
  <TwoColumns>
    <ProjectInfoSection slot="left" />
    <ProjectStatusSection slot="right" />
  </TwoColumns>
</section>

<style lang="scss">
  @use "../../../lib/themes/mixins/media";

  section {
    box-sizing: border-box;
    min-height: 100%;
    padding: var(--padding-2x) var(--padding);

    display: flex;
    align-items: stretch;

    @include media.min-width(medium) {
      padding: var(--padding-2x) var(--padding-2_5x);
    }
  }
</style>

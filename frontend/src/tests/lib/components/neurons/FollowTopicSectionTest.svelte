<script lang="ts">
  import FollowTopicSection from "$lib/components/neurons/FollowTopicSection.svelte";

  export let title: string;
  export let subtitle: string;
  export let count: number;
  export let id: string;
</script>

<FollowTopicSection {count} {id}>
  <h3 slot="title">{title}</h3>
  <p slot="subtitle">{subtitle}</p>
  <div data-tid="followee-children">
    <p>Followee</p>
  </div>
</FollowTopicSection>

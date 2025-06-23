<script lang="ts">
  import FollowTopicSection from "$lib/components/neurons/FollowTopicSection.svelte";

  type Props = {
    id: string;
    count: number;
    title: string;
    subtitle: string;
    openNewFolloweeModal: () => void;
  };
  const {
    id,
    count,
    title,
    subtitle,
    openNewFolloweeModal = () => {},
  }: Props = $props();
</script>

<FollowTopicSection {count} {id} {title} {subtitle} {openNewFolloweeModal}>
  <div data-tid="followee-children">
    <p>Followee</p>
  </div>
</FollowTopicSection>

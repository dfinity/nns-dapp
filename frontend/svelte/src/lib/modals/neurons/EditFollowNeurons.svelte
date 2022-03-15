<script>
  import FollowTopicSection from "../../components/neurons/FollowTopicSection.svelte";

  import Card from "../../components/ui/Card.svelte";
  import { i18n } from "../../stores/i18n";
</script>

<section>
  <p>{$i18n.neurons.follow_neurons_description}</p>
  <Card>
    <FollowTopicSection />
  </Card>
</section>

<style lang="scss">
  section {
    padding: 0;
  }
</style>

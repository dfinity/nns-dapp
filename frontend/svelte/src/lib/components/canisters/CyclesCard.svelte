<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import Card from "../ui/Card.svelte";

  // TODO: Add Cycles - https://dfinity.atlassian.net/browse/L2-598
  // TODO: UI - https://dfinity.atlassian.net/browse/L2-599
</script>

<Card testId="canister-cycles-card">
  <h4 slot="start">{$i18n.canister_detail.cycles}</h4>
</Card>

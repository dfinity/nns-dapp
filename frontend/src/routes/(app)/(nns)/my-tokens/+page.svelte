<script lang="ts">
  import MyTokens from "$lib/pages/MyTokens.svelte";
  import { ActionTypes, type Action } from "$lib/types/actions";

  // Call services to load necessary data. Maybe one service to rule them all?

  // This would be a derived store.
  const data = [
    { name: "ICP", balance: "3.14", id: "1" },
    { name: "Open Chat", balance: "1.2311", id: "2" },
  ];

  const manageActions = ({ detail: action }: CustomEvent<Action>) => {
    switch (action.type) {
      case ActionTypes.TOGGLE_FAVORITE: {
        console.log(action.id);
        console.log("call service to toggle favorite");
        return;
      }
      case ActionTypes.OPEN_SEND_MODAL: {
        console.log(action.fromAccount);
        console.log("open modal");
        return;
      }
      default: {
        console.log("Unknown action");
      }
    }
  };
</script>

<MyTokens {data} on:nnsAction={manageActions} />

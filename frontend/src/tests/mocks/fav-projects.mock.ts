import type { FavProject } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";

export const mockFavProject: FavProject = {
  root_canister_id: rootCanisterIdMock,
};

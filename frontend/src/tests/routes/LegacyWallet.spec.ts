/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/svelte";
import { OWN_CANISTER_ID } from "../../lib/constants/canister-ids.constants";
import { CONTEXT_PATH } from "../../lib/constants/routes.constants";
import { routeStore } from "../../lib/stores/route.store";
import LegacyWallet from "../../routes/LegacyWallet.svelte";

describe("LegacyWallet", () => {
  it("should render NnsWallet", () => {
    const snsWalletPath = `${CONTEXT_PATH}/${OWN_CANISTER_ID.toText()}/wallet/1234`;
    routeStore.update({ path: snsWalletPath });
    const { getByTestId } = render(LegacyWallet);
    expect(getByTestId("nns-wallet")).toBeInTheDocument();
  });
});

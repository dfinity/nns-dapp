import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Universe } from "$lib/types/universe";
import { getTableProjects } from "$lib/utils/staking.utils";
import { principal } from "$tests/mocks/sns-projects.mock";

describe("staking.utils", () => {
  describe("getTableProjects", () => {
    const universeId2 = principal(2).toText();

    it("should return an array of TableProject objects", () => {
      const universes: Universe[] = [
        {
          canisterId: OWN_CANISTER_ID_TEXT,
          title: "Internet Computer",
          logo: IC_LOGO_ROUNDED,
        },
        {
          canisterId: universeId2,
          title: "title2",
          logo: "logo2",
        },
      ];

      const tableProjects = getTableProjects({ universes });

      expect(tableProjects).toEqual([
        {
          rowHref: `/neurons/?u=${OWN_CANISTER_ID_TEXT}`,
          domKey: OWN_CANISTER_ID_TEXT,
          title: "Internet Computer",
          logo: IC_LOGO_ROUNDED,
        },
        {
          rowHref: `/neurons/?u=${universeId2}`,
          domKey: universeId2,
          title: "title2",
          logo: "logo2",
        },
      ]);
    });
  });
});

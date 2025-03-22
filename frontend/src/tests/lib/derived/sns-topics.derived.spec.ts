import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  cachedGenericNFDtoMock,
  cachedNativeNFDtoMock,
  topicInfoDtoMock,
} from "$tests/mocks/sns-topics.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";

describe("sns topics store", () => {
  it("should be set to an empty object", () => {
    expect(get(snsTopicsStore)).toEqual({});
  });

  it("should be set to an empty object if no topics found", () => {
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
      },
    ]);
    expect(get(snsTopicsStore)).toEqual({});
  });

  it("should provide topic info", () => {
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        topics: {
          topics: [
            topicInfoDtoMock({
              topic: "DaoCommunitySettings",
              name: "Topic1",
              description: "This is a description",
              isCritical: false,
              nativeFunctions: [cachedNativeNFDtoMock],
              customFunctions: [cachedGenericNFDtoMock],
            }),
          ],
          uncategorized_functions: [
            {
              ...cachedNativeNFDtoMock,
              name: "Uncategorized Native Function",
            },
          ],
        },
      },
    ]);
    expect(get(snsTopicsStore)).toEqual({
      [mockPrincipal.toText()]: {
        topics: [
          [
            {
              custom_functions: [
                [
                  {
                    description: [
                      "Generic Nervous System Function Description",
                    ],
                    function_type: [
                      {
                        GenericNervousSystemFunction: {
                          target_canister_id: [],
                          target_method_name: [],
                          topic: [
                            {
                              DaoCommunitySettings: null,
                            },
                          ],
                          validator_canister_id: [],
                          validator_method_name: [],
                        },
                      },
                    ],
                    id: 1n,
                    name: "Generic Motion",
                  },
                ],
              ],
              description: ["This is a description"],
              is_critical: [false],
              name: ["Topic1"],
              native_functions: [
                [
                  {
                    description: ["Native Nervous System Function Description"],
                    function_type: [
                      {
                        NativeNervousSystemFunction: {},
                      },
                    ],
                    id: 1n,
                    name: "Motion",
                  },
                ],
              ],
              topic: [
                {
                  DaoCommunitySettings: null,
                },
              ],
            },
          ],
        ],
        uncategorized_functions: [
          [
            {
              description: ["Native Nervous System Function Description"],
              function_type: [
                {
                  NativeNervousSystemFunction: {},
                },
              ],
              id: 1n,
              name: "Uncategorized Native Function",
            },
          ],
        ],
      },
    });
  });
});

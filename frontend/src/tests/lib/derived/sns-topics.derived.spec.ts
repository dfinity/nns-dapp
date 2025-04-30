import {
  createEnableFilteringBySnsTopicsStore,
  createSnsTopicsProjectStore,
  snsTopicsStore,
} from "$lib/derived/sns-topics.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { unsupportedFilterByTopicSnsesStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import { convertDtoTopicInfo } from "$lib/utils/sns-aggregator-converters.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
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

  describe("createSnsTopicsProjectStore", () => {
    it("should provide topic info for sns", () => {
      const topicInfoDto1 = topicInfoDtoMock({
        topic: "DaoCommunitySettings",
        name: "Topic1",
        description: "This is a description",
      });
      const topicInfoDto2 = topicInfoDtoMock({
        topic: "Governance",
        name: "Topic2",
        description: "This is a description 2",
      });
      setSnsProjects([
        {
          rootCanisterId: principal(321),
          topics: {
            topics: [],
            uncategorized_functions: [],
          },
        },
        {
          rootCanisterId: mockPrincipal,
          topics: {
            topics: [topicInfoDto1, topicInfoDto2],
            uncategorized_functions: [],
          },
        },
        {
          rootCanisterId: principal(123),
          topics: {
            topics: [],
            uncategorized_functions: [],
          },
        },
      ]);

      const store = createSnsTopicsProjectStore(mockPrincipal);
      expect(get(store)).toEqual([
        convertDtoTopicInfo(topicInfoDto1),
        convertDtoTopicInfo(topicInfoDto2),
      ]);
    });

    it("should return undefined when sns supports no topics", () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
        },
      ]);

      const store = createSnsTopicsProjectStore(mockPrincipal);
      expect(get(store)).toEqual(undefined);
    });

    it("should return undefined for unknown sns", () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
        },
      ]);

      const store = createSnsTopicsProjectStore(principal(123));
      expect(get(store)).toEqual(undefined);
    });
  });

  describe("createSnsTopicsProposalsFilteringStore", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", true);

      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          topics: {
            topics: [
              topicInfoDtoMock({
                topic: "DaoCommunitySettings",
                name: "Topic1",
                description: "This is a description",
              }),
            ],
            uncategorized_functions: [],
          },
        },
      ]);
    });

    it("should return false when rootCanisterId is null", () => {
      const store = createEnableFilteringBySnsTopicsStore(null);
      expect(get(store)).toBe(false);
    });

    it("should return false when rootCanisterId is undefined", () => {
      const store = createEnableFilteringBySnsTopicsStore(undefined);
      expect(get(store)).toBe(false);
    });

    it("should return false when ENABLE_SNS_TOPICS is false", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", false);

      const store = createEnableFilteringBySnsTopicsStore(mockPrincipal);
      expect(get(store)).toBe(false);
    });

    it("should return false when topics don't exist for the project", () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
        },
      ]);

      const store = createEnableFilteringBySnsTopicsStore(mockPrincipal);
      expect(get(store)).toBe(false);
    });

    it("should return false when the project is in the unsupportedFilterByTopicSnsesStore", () => {
      unsupportedFilterByTopicSnsesStore.add(mockPrincipal.toText());

      const store = createEnableFilteringBySnsTopicsStore(mockPrincipal);
      expect(get(store)).toBe(false);
    });

    it("should return true when all conditions are met", () => {
      const store = createEnableFilteringBySnsTopicsStore(mockPrincipal);
      expect(get(store)).toBe(true);
    });
  });
});

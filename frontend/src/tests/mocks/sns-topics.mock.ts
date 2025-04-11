import type {
  CachedNervousFunctionDto,
  TopicInfoDto,
} from "$lib/types/sns-aggregator";
import type { SnsTopic } from "@dfinity/sns";

export const topicTypeMock = "DaoCommunitySettings";
export const topicMock: SnsTopic = {
  [topicTypeMock]: null,
};

export const cachedNativeNFDtoMock: CachedNervousFunctionDto = {
  id: 1,
  name: "Motion",
  description: "Native Nervous System Function Description",
  function_type: {
    NativeNervousSystemFunction: {},
  },
};

export const cachedGenericNFDtoMock: CachedNervousFunctionDto = {
  id: 1,
  name: "Generic Motion",
  description: "Generic Nervous System Function Description",
  function_type: {
    GenericNervousSystemFunction: {
      validator_canister_id: null,
      target_canister_id: null,
      validator_method_name: null,
      target_method_name: null,
      topic: topicMock,
    },
  },
};

export const topicInfoDtoMock = ({
  topic,
  name,
  description,
  isCritical = false,
  nativeFunctions = [],
  customFunctions = [],
}: {
  topic: string;
  name: string;
  description: string;
  isCritical?: boolean;
  nativeFunctions?: CachedNervousFunctionDto[];
  customFunctions?: CachedNervousFunctionDto[];
}): TopicInfoDto => ({
  topic,
  name,
  description,
  native_functions: nativeFunctions,
  custom_functions: customFunctions,
  is_critical: isCritical,
});

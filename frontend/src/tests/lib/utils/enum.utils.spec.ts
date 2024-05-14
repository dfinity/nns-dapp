import {
  enumKeys,
  enumsExclude,
  enumSize,
  enumsKeys,
  enumValues,
} from "$lib/utils/enum.utils";
import { Topic } from "@dfinity/nns";

describe("enum-utils", () => {
  enum TestEnum {
    A = 0,
    B = 1,
    C = 2,
    D = 3,
  }

  it("should return the values of the enum", () => {
    expect(enumValues(TestEnum)).toEqual([0, 1, 2, 3]);
  });

  it("should return the keys of the enum", () => {
    expect(enumKeys(TestEnum)).toEqual(["A", "B", "C", "D"]);
  });

  it("should return the keys of a subset of enums", () => {
    // TODO: if someone knows how to solve "Type 'typeof TestEnum' is not assignable to type 'TestEnum'." ping me!
    expect(
      enumsKeys<TestEnum>({
        obj: TestEnum as unknown as TestEnum,
        values: [TestEnum.B, TestEnum.C],
      })
    ).toEqual(["B", "C"]);
  });

  it("should return the number of keys of enums", () => {
    expect(enumSize<typeof TestEnum>(TestEnum)).toEqual(4);
  });

  it("should filter all topics", () =>
    expect(
      enumsExclude({ obj: Topic as unknown as Topic, values: [] })
    ).toEqual(enumValues(Topic)));

  it("should exclude no topics", () => {
    const all: Topic[] = enumKeys(Topic).map((key: string) => Topic[key]);

    expect(
      enumsExclude({ obj: Topic as unknown as Topic, values: all })
    ).toEqual([]);
  });

  it("should exclude selected topics", () => {
    const results: Topic[] = [
      Topic.Unspecified,
      Topic.ManageNeuron,
      Topic.ExchangeRate,
      Topic.NetworkEconomics,
      Topic.Governance,
      Topic.NodeAdmin,
      Topic.ParticipantManagement,
      Topic.NetworkCanisterManagement,
      Topic.NodeProviderRewards,
      Topic.SnsDecentralizationSale,
      Topic.SubnetReplicaVersionManagement,
      Topic.ReplicaVersionManagement,
      Topic.SnsAndCommunityFund,
      Topic.ApiBoundaryNodeManagement,
      Topic.SubnetRental,
    ];

    expect(
      enumsExclude({
        obj: Topic as unknown as Topic,
        values: [Topic.SubnetManagement, Topic.Kyc],
      })
    ).toEqual(results);
  });
});

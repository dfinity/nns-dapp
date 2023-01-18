import * as rest from "$lib/rest/governance-metrics.rest";
import { totalDissolvingNeurons } from "$lib/services/$public/governance-metrics.services";
import { governanceMetricsText } from "../../../mocks/metrics.mock";

describe("governance-metrics", () => {
  afterEach(() => jest.clearAllMocks());

  it("should return null if no API results", async () => {
    const metricsRestSpy = jest
      .spyOn(rest, "governanceMetrics")
      .mockImplementation(() => Promise.resolve(null));

    const result = await totalDissolvingNeurons();

    expect(result).toBeNull();
    expect(metricsRestSpy).toHaveBeenCalled();
  });

  it("should return null if no corresponding text key is found", async () => {
    const metricsRestSpy = jest
      .spyOn(rest, "governanceMetrics")
      .mockImplementation(() => Promise.resolve(governanceMetricsText));

    const result = await totalDissolvingNeurons();

    expect(result).toBeNull();
    expect(metricsRestSpy).toHaveBeenCalled();
  });

  it("should return null if no valid numbers are found", async () => {
    const text = `${governanceMetricsText}
governance_dissolving_neurons_e8s_count test test`;

    const metricsRestSpy = jest
      .spyOn(rest, "governanceMetrics")
      .mockImplementation(() => Promise.resolve(text));

    const result = await totalDissolvingNeurons();

    expect(result).toBeNull();
    expect(metricsRestSpy).toHaveBeenCalled();
  });

  it("should return null if no numbers are found", async () => {
    const text = `${governanceMetricsText}
governance_dissolving_neurons_e8s_count
# HELP governance_dissolving_neurons_count Total number of dissolving neurons, grouped by dissolve delay (in years)`;

    const metricsRestSpy = jest
      .spyOn(rest, "governanceMetrics")
      .mockImplementation(() => Promise.resolve(text));

    const result = await totalDissolvingNeurons();

    expect(result).toBeNull();
    expect(metricsRestSpy).toHaveBeenCalled();
  });

  it("should return null if only dissolving number is found", async () => {
    const text = `${governanceMetricsText}
governance_dissolving_neurons_e8s_count 8147494574194015
# HELP governance_dissolving_neurons_count Total number of dissolving neurons, grouped by dissolve delay (in years)`;

    const metricsRestSpy = jest
      .spyOn(rest, "governanceMetrics")
      .mockImplementation(() => Promise.resolve(text));

    const result = await totalDissolvingNeurons();

    expect(result).toBeNull();
    expect(metricsRestSpy).toHaveBeenCalled();
  });

  it("should return null if only not dissolving number is found", async () => {
    const text = `${governanceMetricsText}
governance_dissolving_neurons_e8s_count test 1674031880551
# HELP governance_dissolving_neurons_count Total number of dissolving neurons, grouped by dissolve delay (in years)`;

    const metricsRestSpy = jest
      .spyOn(rest, "governanceMetrics")
      .mockImplementation(() => Promise.resolve(text));

    const result = await totalDissolvingNeurons();

    expect(result).toBeNull();
    expect(metricsRestSpy).toHaveBeenCalled();
  });

  it("should return dissolving metrics", async () => {
    const totalDissolving = 8147494574194015;
    const totalNotDissolving = 1674031880551;

    const text = `${governanceMetricsText}
governance_dissolving_neurons_e8s_count ${totalDissolving} ${totalNotDissolving}
# HELP governance_dissolving_neurons_count Total number of dissolving neurons, grouped by dissolve delay (in years)`;

    const metricsRestSpy = jest
      .spyOn(rest, "governanceMetrics")
      .mockImplementation(() => Promise.resolve(text));

    const result = await totalDissolvingNeurons();

    expect(result.totalDissolvingNeurons).toEqual(totalDissolving);
    expect(result.totalNotDissolvingNeurons).toEqual(totalNotDissolving);
    expect(metricsRestSpy).toHaveBeenCalled();
  });
});

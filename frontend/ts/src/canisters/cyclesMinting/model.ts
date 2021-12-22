export default interface ServiceInterface {
  getIcpToCyclesConversionRate: () => Promise<bigint>;
}

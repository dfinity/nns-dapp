import ServiceInterface from './model';
import { _SERVICE } from './rawService';

const CYCLES_PER_XDR = BigInt(1_000_000_000_000); // 1 trillion

export default class Service implements ServiceInterface {
  private readonly service: _SERVICE;

  public constructor(service: _SERVICE) {
    this.service = service;
  }

  public getIcpToCyclesConversionRate = async (): Promise<bigint> => {
    const response = await this.service.get_icp_xdr_conversion_rate();

    // TODO validate the certificate in the response
    return (response.data.xdr_permyriad_per_icp * CYCLES_PER_XDR) / BigInt(10_000);
  };
}

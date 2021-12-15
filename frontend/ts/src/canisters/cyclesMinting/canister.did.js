export const idlFactory = ({ IDL }) => {
  const IcpXdrConversionRate = IDL.Record({
    'xdr_permyriad_per_icp' : IDL.Nat64,
    'timestamp_seconds' : IDL.Nat64,
  });
  const IcpXdrConversionRateCertifiedResponse = IDL.Record({
    'certificate' : IDL.Vec(IDL.Nat8),
    'data' : IcpXdrConversionRate,
    'hash_tree' : IDL.Vec(IDL.Nat8),
  });
  return IDL.Service({
    'get_icp_xdr_conversion_rate' : IDL.Func(
        [],
        [IcpXdrConversionRateCertifiedResponse],
        ['query'],
    ),
  });
};
export const init = ({ IDL }) => { return []; };
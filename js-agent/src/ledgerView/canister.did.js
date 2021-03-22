export default ({ IDL }) => {
  const SearchRequest = IDL.Record({
    'page_size' : IDL.Nat8,
    'offset' : IDL.Nat32,
  });
  const Doms = IDL.Nat64;
  const Timestamp = IDL.Record({ 'secs' : IDL.Nat64, 'nanos' : IDL.Nat32 });
  const BlockHeight = IDL.Nat64;
  const Send = IDL.Record({
    'to' : IDL.Principal,
    'fee' : Doms,
    'amount' : Doms,
  });
  const Receive = IDL.Record({
    'fee' : Doms,
    'from' : IDL.Principal,
    'amount' : Doms,
  });
  const Transfer = IDL.Variant({
    'Burn' : IDL.Record({ 'amount' : Doms }),
    'Mint' : IDL.Record({ 'amount' : Doms }),
    'Send' : Send,
    'Receive' : Receive,
  });
  const Transaction = IDL.Record({
    'balance' : Doms,
    'timestamp' : Timestamp,
    'block_height' : BlockHeight,
    'transfer' : Transfer,
  });
  const SearchResponse = IDL.Record({
    'total' : Doms,
    'transactions' : IDL.Vec(Transaction),
  });
  return IDL.Service({
    'search' : IDL.Func([SearchRequest], [SearchResponse], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };

export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getBackgroundColor' : IDL.Func([], [IDL.Text], []),
    'getSmileyChar' : IDL.Func([], [IDL.Text], []),
    'setBackgroundColor' : IDL.Func([IDL.Text], [], []),
    'setSmileyChar' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };

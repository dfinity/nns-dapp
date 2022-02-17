export const getNnsFunctionName = (nnsFunction: number): string => {
  switch (nnsFunction) {
    case 1:
      return "Create subnet";
    case 2:
      return "Add nodes to subnet";
    case 3:
      return "Install NNS canister";
    case 4:
      return "Upgrade NNS canister";
    case 5:
      return "Bless replica version";
    case 6:
      return "Recover subnet";
    case 7:
      return "Update subnet config";
    case 8:
      return "Assign node operator Id";
    case 9:
      return "Update NNS root canister";
    case 10:
      return "Update ICP/XDR conversion rate";
    case 11:
      return "Update subnet replica version";
    case 12:
      return "Clear provisional whitelist";
    case 13:
      return "Remove nodes from subnet";
    case 14:
      return "Set authorized subnetworks";
    case 15:
      return "Change firewall config";
    case 16:
      return "Update node operator config";
    case 17:
      return "Start or stop NNS canister";
    case 18:
      return "Remove nodes from registry";
    case 19:
      return "Uninstall code from canister";
    case 20:
      return "Update the node rewards table";
    case 21:
      return "Add or remove data centers";
    case 22:
      return "Update unassigned nodes config";
    case 23:
      return "Remove node operators";
    case 24:
      return "Reroute canister range";
    default:
      return "--Unknown--";
  }
};

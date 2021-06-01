enum TransactionType {
  Burn,
  Mint,
  Send,
  StakeNeuron,
  StakeNeuronNotification,
  TopUpNeuron,
  CreateCanister,
  TopUpCanister
}

extension ShouldShowFee on TransactionType {
  bool shouldShowFee(bool isReceive) {
    if (isReceive) {
      return false;
    }
    switch (this) {
      case TransactionType.Mint:
      case TransactionType.Burn:
        return false;
      default:
        return true;
    }
  }
}

extension GetName on TransactionType {
  String getName(bool isReceive) {
    switch (this) {
      case TransactionType.Send: return isReceive ? "Received ICP" : "Sent ICP";
      case TransactionType.Mint: return "Received ICP";
      case TransactionType.Burn: return "Sent ICP";
      case TransactionType.StakeNeuron: return "Stake Neuron";
      case TransactionType.StakeNeuronNotification: return "Stake Neuron (Part 2 of 2)";
      case TransactionType.TopUpNeuron: return "Top-up Neuron";
      case TransactionType.CreateCanister: return "Create Canister";
      case TransactionType.TopUpCanister: return "Top-up Canister";
    }
  }
}

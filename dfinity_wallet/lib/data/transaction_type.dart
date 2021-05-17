import 'package:hive/hive.dart';


enum TransactionType {
  Send,
  Receive,
  Mint,
  Burn,
  StakeNeuron,
  StakeNeuronNotification,
  CreateCanister,
  CreateCanisterNotification,
  TopUpCanister,
  TopUpCanisterNotification
}

extension ShouldShowFee on TransactionType {
  bool shouldShowFee() {
    switch (this) {
      case TransactionType.Receive:
      case TransactionType.Mint:
      case TransactionType.Burn:
        return false;
      default:
        return true;
    }
  }
}

extension GetName on TransactionType {
  String getName() {
    switch (this) {
      case TransactionType.Send: return "Sent ICP";
      case TransactionType.Receive: return "Received ICP";
      case TransactionType.Mint: return "Received ICP";
      case TransactionType.Burn: return "Sent ICP";
      case TransactionType.StakeNeuron: return "Stake Neuron (Part 1 of 2)";
      case TransactionType.StakeNeuronNotification: return "Stake Neuron (Part 2 of 2)";
      case TransactionType.CreateCanister: return "Create Canister (Part 1 of 2)";
      case TransactionType.CreateCanisterNotification: return "Create Canister (Part 2 of 2)";
      case TransactionType.TopUpCanister: return "Top-up Canister (Part 1 of 2)";
      case TransactionType.TopUpCanisterNotification: return "Top-up Canister (Part 2 of 2)";
    }
  }
}

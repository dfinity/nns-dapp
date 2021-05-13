import 'package:hive/hive.dart';

part 'transaction_type.g.dart';

@HiveType(typeId: 114)
enum TransactionType {
  @HiveField(0)
  Send,
  @HiveField(1)
  Receive,
  @HiveField(2)
  Mint,
  @HiveField(3)
  Burn,
  @HiveField(4)
  StakeNeuron,
  @HiveField(5)
  StakeNeuronNotification,
  @HiveField(6)
  CreateCanister,
  @HiveField(7)
  CreateCanisterNotification,
  @HiveField(8)
  TopUpCanister,
  @HiveField(9)
  TopUpCanisterNotification
}

extension ShouldDisplayNameOnUi on TransactionType {
  bool shouldDisplayNameOnUi() {
    switch (this) {
      case TransactionType.StakeNeuron:
      case TransactionType.StakeNeuronNotification:
      case TransactionType.CreateCanister:
      case TransactionType.CreateCanisterNotification:
      case TransactionType.TopUpCanister:
      case TransactionType.TopUpCanisterNotification:
        return true;
      default:
        return false;
    }
  }
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
      case TransactionType.Send: return "Send";
      case TransactionType.Receive: return "Receive";
      case TransactionType.Mint: return "Mint";
      case TransactionType.Burn: return "Burn";
      case TransactionType.StakeNeuron: return "Stake Neuron Transfer";
      case TransactionType.StakeNeuronNotification: return "Stake Neuron Notification";
      case TransactionType.CreateCanister: return "Create Canister Transfer";
      case TransactionType.CreateCanisterNotification: return "Create Canister Notification";
      case TransactionType.TopUpCanister: return "Top-up Canister Transfer";
      case TransactionType.TopUpCanisterNotification: return "Top-up Canister Notification";
    }
  }
}

@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

class ICPTs {
  ICPTs({required this.doms});

  BigInt doms;
}

class AccountDetails {
  late String defaultAccount;
  late List<NamedSubAccount> subAccounts;

  AccountDetails(Map<String, dynamic> json) {
      defaultAccount = json["accountIdentifier"]!.toString();
      subAccounts = (json["subAccounts"] as List<dynamic>).map((e) => NamedSubAccount(
          accountIdentifier: e.accountIdentifier.toString(),
          name: e.name.toString(),
          subAccount: e.subAccountId.map((e) => e.toList().toInt()))
      ).toList();
  }
}

class NamedSubAccount {
  final String accountIdentifier;
  final String name;
  final List<int> subAccount;

  NamedSubAccount(
      {required this.accountIdentifier,
      required this.name,
      required this.subAccount});
}

@JS()
class Principal {
  external String toString();
}

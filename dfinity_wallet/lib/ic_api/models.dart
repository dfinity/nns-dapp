class ICPTs {
  ICPTs({required this.doms});
  BigInt doms;
}

class AccountDetails {
  external Principal defaultAccount;
  external List<NamedSubAccount> subAccounts;
}

class NamedSubAccount {
  late Principal principal;
  late String name;
  dynamic subAccount;
}

class Principal {
 external String toString();
}

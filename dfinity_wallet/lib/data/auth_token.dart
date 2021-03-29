
import 'package:hive/hive.dart';

part 'auth_token.g.dart';

const WEB_TOKEN_KEY = "WEB_TOKEN_KEY";

@HiveType(typeId: 6)
class AuthToken extends HiveObject{

  @HiveField(0)
  DateTime? creationDate;

  @HiveField(1)
  String? data;

  @HiveField(2)
  late String key;
}

extension WebAuthToken on Box<AuthToken>{
  AuthToken? get webAuthToken => get(WEB_TOKEN_KEY);
}
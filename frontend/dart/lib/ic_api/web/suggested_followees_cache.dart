import 'package:nns_dapp/ui/neurons/following/followee_suggestions.dart';

class SuggestedFolloweesCache {
  final GetSuggestedFolloweesFunc func;
  late List<FolloweeSuggestion>? suggestedFollowees = null;

  SuggestedFolloweesCache({required GetSuggestedFolloweesFunc this.func}) {}

  Future<List<FolloweeSuggestion>> get() async {
    if (suggestedFollowees == null) {
      suggestedFollowees = await this.func();
    }
    return suggestedFollowees!;
  }
}

typedef Future<List<FolloweeSuggestion>> GetSuggestedFolloweesFunc();

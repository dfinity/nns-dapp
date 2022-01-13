import 'package:nns_dapp/ui/neurons/following/followee_suggestions.dart';

class SuggestedFolloweesCache {
  final GetSuggestedFolloweesFunc func;
  List<FolloweeSuggestion>? suggestedFollowees;

  SuggestedFolloweesCache({required GetSuggestedFolloweesFunc this.func});

  Future<List<FolloweeSuggestion>> get() async {
    if (suggestedFollowees == null) {
      suggestedFollowees = await this.func();
    }
    return suggestedFollowees!;
  }
}

typedef Future<List<FolloweeSuggestion>> GetSuggestedFolloweesFunc();

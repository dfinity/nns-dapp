import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/neuron_info/neuron_info_widget.dart';

import '../../../dfinity.dart';

class FolloweeSuggestionWidget extends StatefulWidget {
  final List<String> followees;
  final Function(FolloweeSuggestion) suggestionSelected;

  const FolloweeSuggestionWidget(this.followees,
      {Key? key, required this.suggestionSelected})
      : super(key: key);

  @override
  _FolloweeSuggestionWidgetState createState() =>
      _FolloweeSuggestionWidgetState();
}

class _FolloweeSuggestionWidgetState extends State<FolloweeSuggestionWidget> {
  late List<FolloweeSuggestion> suggestions;

  @override
  void initState() {
    super.initState();
    suggestions =
        FolloweeSuggestion.followerSuggestions.shuffled().take(3).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: suggestions
            .filterNot((element) => widget.followees.contains(element.id))
            .mapToList((e) => FolloweeSuggestionRow(
                  suggestion: e,
                  selected: () {
                    widget.suggestionSelected(e);
                  },
                ))
            .interspace(Divider(
              color: AppColors.white,
            ))
            .toList(),
      ),
    );
  }
}

class FolloweeSuggestionRow extends StatelessWidget {
  final FolloweeSuggestion suggestion;
  final Function() selected;

  const FolloweeSuggestionRow(
      {Key? key, required this.suggestion, required this.selected})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextButton(
                  child: Align(
                      alignment: Alignment.bottomLeft,
                      child: Text(suggestion.name,
                          style: Responsive.isMobile(context)
                              ? context.textTheme.bodyText2
                              : context.textTheme.bodyText1)),
                  onPressed: () {
                    OverlayBaseWidget.show(
                        context, NeuronInfoWidget(suggestion.id));
                  },
                ),
              ],
            ),
          ),
          Center(
            child: Padding(
              padding: EdgeInsets.all(8),
              child: ElevatedButton(
                onPressed: selected,
                style: ButtonStyle(
                    backgroundColor:
                        MaterialStateProperty.all(AppColors.gray800)),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    "Follow",
                    style: TextStyle(
                        fontSize: Responsive.isMobile(context) ? 14 : 20),
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}

class FolloweeSuggestion {
  final String name;
  final String text;
  final String id;

  FolloweeSuggestion(this.name, this.text, this.id);

  static List<FolloweeSuggestion> followerSuggestions = [
    FolloweeSuggestion("DFINITY Foundation", "", "27"),
    FolloweeSuggestion("Internet Computer Association", "", "28"),
  ];
}

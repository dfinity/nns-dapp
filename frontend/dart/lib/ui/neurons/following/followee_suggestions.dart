import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/neuron_info/neuron_info_widget.dart';
import '../../../nns_dapp.dart';

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
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: FutureBuilder(
        future: context.icApi.followeeSuggestions(),
        builder: (BuildContext context,
            AsyncSnapshot<List<FolloweeSuggestion>> snapshot) {
          if (snapshot.hasData) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: snapshot.data!
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
            );
          }
          return Text('Loading..');
        },
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
  final String? description;
  final String id;

  FolloweeSuggestion(this.name, this.description, this.id);
}

import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';

import '../../dfinity.dart';

class ProposalDetailWidget extends StatefulWidget {
  final Proposal proposal;

  const ProposalDetailWidget(this.proposal, {Key? key}) : super(key: key);

  @override
  _ProposalDetailWidgetState createState() => _ProposalDetailWidgetState();
}

class _ProposalDetailWidgetState extends State<ProposalDetailWidget> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("Proposal"),
          backgroundColor: AppColors.background,
        ),
        body: Container(
            color: AppColors.lightBackground,
            child: ConstrainWidthAndCenter(
                child: ListView(children: [
              Container(
                width: double.infinity,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Container(
                          decoration: ShapeDecoration(
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  side: BorderSide(
                                      width: 2, color: Color(0xffFBB03B)))),
                          child: Padding(
                            padding: EdgeInsets.all(8.0),
                            child: Text(
                              "Open",
                              style: TextStyle(
                                  fontSize: 24,
                                  fontFamily: Fonts.circularBook,
                                  color: Color(0xffFBB03B),
                                  fontWeight: FontWeight.normal),
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text(
                          widget.proposal.text,
                          style: context.textTheme.headline3,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text(
                          "By: ${widget.proposal.proposer}",
                          style: context.textTheme.bodyText1,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: SliderTheme(
                          data: SliderThemeData(
                            inactiveTrackColor: Color(0xffED1E79),
                            activeTrackColor: Color(0xff80ACF8),
                            thumbColor: Colors.transparent,
                          ),
                          child: Slider(
                            value: widget.proposal.yes.toDouble(),
                            min: 0,
                            max: widget.proposal.yes.toDouble() +
                                widget.proposal.no.toDouble(),
                            divisions: 1000,
                            onChanged: (e) {},
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Card(
                          color: AppColors.background,
                          child: Container(
                            padding: EdgeInsets.all(16.0),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Padding(
                                        padding: EdgeInsets.all(16.0),
                                        child: Text("Voting Power", style: context.textTheme.headline3)
                                      ),
                                    ),
                                    Padding(
                                        padding: EdgeInsets.all(4.0),
                                        child: Text(context.boxes.neurons.values.sumBy((element) => element.icpBalance).toStringAsFixed(2), style: context.textTheme.headline2,)
                                    ),
                                    Padding(
                                        padding: EdgeInsets.all(4.0),
                                        child: Text("Votes",)
                                    ),
                                  ],
                                ),
                                ...context.boxes.neurons.values.map((e) => Container(
                                  child: Row(
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Checkbox(
                                          value: true, onChanged: (bool? value) {  },
                                        ),
                                      ),
                                      Expanded(
                                        child: Padding(
                                            padding: EdgeInsets.all(16.0),
                                            child: Text(e.identifier)
                                        ),
                                      ),
                                      Padding(
                                          padding: EdgeInsets.all(16.0),
                                          child: Text("${e.icpBalance.toStringAsFixed(2)  } votes")
                                      ),
                                    ],
                                  ),
                                ))
                              ],
                            ),
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          Expanded(
                              child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: ElevatedButton(
                              onPressed: () {},
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Text("For"),
                              ),
                              style: ButtonStyle(
                                  backgroundColor: MaterialStateProperty.all(
                                      Color(0xff80ACF8))),
                            ),
                          )),
                          Expanded(
                              child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: ElevatedButton(
                              onPressed: () {},
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Text("Against"),
                              ),
                              style: ButtonStyle(
                                  backgroundColor: MaterialStateProperty.all(
                                      Color(0xffED1E79))),

                            ),
                          )),
                        ],
                      ),
                    ],
                  ),
                ),
              )
            ]))));
  }
}

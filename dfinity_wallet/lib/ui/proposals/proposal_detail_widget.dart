import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';

import '../../dfinity.dart';

class ProposalDetailWidget extends StatefulWidget {
  final Proposal proposal;

  const ProposalDetailWidget(this.proposal, {Key? key})
      : super(key: key);

  @override
  _ProposalDetailWidgetState createState() => _ProposalDetailWidgetState();
}

class _ProposalDetailWidgetState extends State<ProposalDetailWidget> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("Proposal"),
        ),
        body: Container(
            color: AppColors.lightBackground,
            child: FooterGradientButton(
              body: ListView(children: [
                Card(
                  child: Container(
                    width: double.infinity,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            widget.proposal.name,
                            style: context.textTheme.headline3
                                ?.copyWith(color: AppColors.gray800),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(
                              left: 16.0, bottom: 16.0, right: 16.0),
                          child: Text(
                            widget.proposal.authorAddress,
                            style: context.textTheme.bodyText1
                                ?.copyWith(color: AppColors.gray800),
                          ),
                        ),
                        ListTile(
                          title: Text("Neurons:"),
                        )
                      ],
                    ),
                  ),
                )
              ]),
              footer: Row(
                children: [
                  Expanded(child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: ElevatedButton(onPressed: () {}, child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text("Reject"),
                    )),
                  )),
                  Expanded(child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: ElevatedButton(onPressed: () {}, child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text("Approve"),
                    )),
                  )),
                ],
              ),
            )));
  }
}

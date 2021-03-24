import 'package:dfinity_wallet/data/proposal.dart';

import '../../dfinity.dart';

class ProposalDetailWidget extends StatefulWidget {
  final int proposalIdentifier;

  const ProposalDetailWidget({Key? key, required this.proposalIdentifier})
      : super(key: key);

  @override
  _ProposalDetailWidgetState createState() => _ProposalDetailWidgetState();
}

class _ProposalDetailWidgetState extends State<ProposalDetailWidget> {
  late Proposal proposal;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    proposal = context.boxes.proposals.get(widget.proposalIdentifier)!;
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
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
                  proposal.name,
                  style: context.textTheme.headline3
                      ?.copyWith(color: AppColors.gray800),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  proposal.authorAddress,
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
    ]);
  }
}

import '../../nns_dapp.dart';

const kTextSizeLarge = 24.0;
const kTextSizeSmall = 16.0;

const kCurrentBalanceSizeBig = 40;
const kCurrentBalanceSizeSmall = 20;

const kTotalNumberOfControllersAllowed = 10;

const SIX_MONTHS_IN_SECONDS = 15778800; // 182.625 * 24 * 60 * 60;
const FOUR_YEARS_IN_SECONDS = SIX_MONTHS_IN_SECONDS * 8;
const EIGHT_YEARS_IN_SECONDS = FOUR_YEARS_IN_SECONDS * 2;

const kProposalSummaryBoxMaxHeight = 300.0;
const kProposalSummaryBoxMinHeight = 30.0;

final kRoundedBorderDecoration = BoxDecoration(
    border: Border.all(color: AppColors.gray600, width: 2),
    borderRadius: BorderRadius.circular(10));

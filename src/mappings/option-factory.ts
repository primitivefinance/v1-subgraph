import { Address, BigInt } from '@graphprotocol/graph-ts';
import { OptionFactory, Option } from '../../generated/schema';
import { Option as OptionTemplate } from '../../generated/templates';
import { DeployCloneCall } from '../../generated/OptionFactory/OptionFactory';
import { Option as OptionContract } from '../../generated/OptionFactory/Option';
import { ZERO_BIGDECIMAL } from './constants';
import { getToken, getMarket } from './helpers';

export function handleCall_deployClone(call: DeployCloneCall): void {
  // loading factory entity or creating if not exist
  let factory = OptionFactory.load(call.to.toHexString());
  if (factory === null) {
    factory = new OptionFactory(call.to.toHexString());
    factory.optionCount = 0;
    factory.marketCount = 0;
    factory.txCount = BigInt.fromI32(0);
  }

  // incrementing option count and writing to storage
  factory.optionCount += 1;
  factory.save();

  // creating option entity
  let optionAddr = call.outputs.value0;
  let option = Option.load(optionAddr.toHexString());
  if (option === null) {
    option = new Option(optionAddr.toHexString());

    option.expiry = 0;
    option.strikeLocked = ZERO_BIGDECIMAL; // BigDecimal!;
    option.underlyingLocked = ZERO_BIGDECIMAL; // BigDecimal!;
    option.strikeVolume = ZERO_BIGDECIMAL; // BigDecimal!;
    option.underlyingVolume = ZERO_BIGDECIMAL; // BigDecimal!;

    let optionContract = OptionContract.bind(optionAddr);

    // registering underlying token entity
    let underlyingTokenAddrResult = optionContract.try_getUnderlyingTokenAddress();
    if (!underlyingTokenAddrResult.reverted) {
      option.underlyingToken = getToken(underlyingTokenAddrResult.value).id;
    }

    // registering strike token entity
    let strikeTokenAddrResult = optionContract.try_getStrikeTokenAddress();
    if (!strikeTokenAddrResult.reverted) {
      option.strikeToken = getToken(strikeTokenAddrResult.value).id;
    }

    // registering option token entity
    {
      let token = getToken(optionAddr);
      token.kind = 'OPTION';
      token.save();
    }

    // registering redeem token entity
    let redeemTokenAddrResult = optionContract.try_redeemToken();
    if (!redeemTokenAddrResult.reverted) {
      let token = getToken(redeemTokenAddrResult.value);
      option.shortToken = token.id;
      token.kind = 'REDEEM';
      token.save();
    }

    // creating market entity
    let market = getMarket(option.underlyingToken + '-' + option.strikeToken);
    option.market = market.id;

    // this would revert and stop indexer if underlyingToken and strikeToken are not set.
    option.save();

    // adding contract address to indexer
    OptionTemplate.create(Address.fromString(option.id));
  }
}

import { Address, BigInt } from '@graphprotocol/graph-ts';
import { OptionFactory, Option, Market } from '../../generated/schema';
import { Option as OptionTemplate } from '../../generated/templates';
import { DeployCloneCall } from '../../generated/OptionFactory/OptionFactory';
import { Option as OptionContract } from '../../generated/OptionFactory/Option';
import { BIGDECIMAL_ONE, BIGINT_ZERO } from './constants';
import { getToken } from './helpers';

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
    option.strikeLocked = BIGDECIMAL_ONE; // BigDecimal!;
    option.underlyingLocked = BIGDECIMAL_ONE; // BigDecimal!;
    option.strikeVolume = BIGDECIMAL_ONE; // BigDecimal!;
    option.underlyingVolume = BIGDECIMAL_ONE; // BigDecimal!;

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
    // let market = getMarket(option.underlyingToken + '-' + option.strikeToken);
    let marketId = option.underlyingToken + '-' + option.strikeToken;
    let market = Market.load(marketId);
    if (market === null) {
      market = new Market(marketId);
      market.totalStrikeLocked = BIGDECIMAL_ONE; // BigDecimal!;
      market.totalUnderlyingLocked = BIGDECIMAL_ONE; // BigDecimal!;
      market.strikeTotalVolume = BIGDECIMAL_ONE; // BigDecimal!;
      market.underlyingTotalVolume = BIGDECIMAL_ONE; // BigDecimal!;
      market.txCount = BIGINT_ZERO; // BigInt!;
      market.factory = factory.id;
      market.save();
    }
    option.market = market.id;
    option.factory = factory.id;

    // this would revert and stop indexer if underlyingToken and strikeToken are not set.
    option.save();

    // adding contract address to indexer
    OptionTemplate.create(Address.fromString(option.id));
  }
}

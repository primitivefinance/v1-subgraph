import { Address, BigInt } from '@graphprotocol/graph-ts';
import { OptionFactory, Option, Market } from '../../generated/schema';
import {
  Option as OptionTemplate,
  ERC20Token as ERC20Template,
} from '../../generated/templates';
import { DeployCloneCall } from '../../generated/OptionFactory/OptionFactory';
import { Option as OptionContract } from '../../generated/OptionFactory/Option';
import { BIGDECIMAL_ONE, BIGINT_ZERO, ADDRESS_DAI } from './constants';
import {
  getToken,
  recordTransaction,
  convertBigIntToBigDecimal,
} from './helpers';

/**
 * This method is called by the indexer whenever it finds call
 * @param call contains inputs outputs and other tx, block info
 */
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

    // fetching base value in underlying token unit
    let baseResult = optionContract.try_getBaseValue();
    if (!baseResult.reverted) {
      option.base = convertBigIntToBigDecimal(
        baseResult.value,
        getToken(underlyingTokenAddrResult.value).decimals
      );
    }

    // fetching quote value in strike token unit
    let quoteResult = optionContract.try_getQuoteValue();
    if (!quoteResult.reverted) {
      option.quote = convertBigIntToBigDecimal(
        quoteResult.value,
        getToken(strikeTokenAddrResult.value).decimals
      );
    }

    // fetching expiry time
    let expiryResult = optionContract.try_getExpiryTime();
    if (!expiryResult.reverted) {
      option.expiry = expiryResult.value;
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

    // setting extended info
    // strike price
    option.strikePrice =
      option.underlyingToken == ADDRESS_DAI.toString()
        ? option.base
        : option.quote;

    // open interest, updated when Mint event handler
    let optionTotalSupplyResult = optionContract.try_totalSupply();
    if (!optionTotalSupplyResult.reverted) {
      option.openInterest = convertBigIntToBigDecimal(
        optionTotalSupplyResult.value,
        getToken(optionAddr).decimals
      );
    }

    // strike date
    option.strikeDate = option.expiry;

    // token
    option.token =
      option.underlyingToken == ADDRESS_DAI.toString()
        ? option.strikeToken
        : option.underlyingToken;

    // premium, updated in uniswap pair Sync event handler
    option.premium = null;

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
    ERC20Template.create(Address.fromString(option.id));
    ERC20Template.create(Address.fromString(option.shortToken));
    ERC20Template.create(Address.fromString(option.shortToken));
    // ERC20Template.create(Address.fromString(option.uniswapPair)); // uniswapPair is null here, done in uniswap-pair-factory.ts

    recordTransaction(
      call.transaction.hash.toHexString(),
      call.block.number,
      call.block.timestamp,
      option.factory,
      option.market,
      option.id,
      'NEW_MARKET'
    );
  }
}

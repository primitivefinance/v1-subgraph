import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { Token, Market } from '../../generated/schema';
import { ERC20 } from '../../generated/OptionFactory/ERC20';
import { ZERO_BIGDECIMAL, ZERO_BIGINT } from './constants';

export function getToken(tokenAddr: Address): Token {
  let token = Token.load(tokenAddr.toHexString());
  if (token === null) {
    token = new Token(tokenAddr.toHexString());
    token.symbol = 'unknown';
    token.name = 'unknown';
    token.decimals = BigInt.fromI32(0);
    token.kind = 'OTHER'; // this is later changed to appropriate value
    let contract = ERC20.bind(tokenAddr);
    {
      let symbolCallResult = contract.try_symbol();
      if (!symbolCallResult.reverted) {
        token.symbol = symbolCallResult.value;
      }
    }
    {
      let nameResult = contract.try_name();
      if (!nameResult.reverted) {
        token.name = nameResult.value;
      }
    }
    {
      let decimalResult = contract.try_decimals();
      if (!decimalResult.reverted) {
        token.decimals = BigInt.fromI32(decimalResult.value);
      }
    }
    token.save();
  }
  return token as Token;
}

export function getMarket(id: string): Market {
  // let id = option.underlyingToken + '-' + option.strikeToken;
  let market = Market.load(id);
  if (market === null) {
    market = new Market(id);
    // market.options = [option.id]; // [Option!]!;
    market.totalStrikeLocked = ZERO_BIGDECIMAL; // BigDecimal!;
    market.totalUnderlyingLocked = ZERO_BIGDECIMAL; // BigDecimal!;
    market.strikeTotalVolume = ZERO_BIGDECIMAL; // BigDecimal!;
    market.underlyingTotalVolume = ZERO_BIGDECIMAL; // BigDecimal!;
    market.txCount = ZERO_BIGINT; // BigInt!;
    market.save();
  }
  return market as Market;
}

export function convertBigIntToBigDecimal(
  bigInt: BigInt,
  decimals: BigInt
): BigDecimal {
  // preventing div by zero
  if (decimals === ZERO_BIGINT) {
    return bigInt.toBigDecimal();
  }
  // creating 10^decimals
  let denominator = BigDecimal.fromString('1');
  for (
    let i = ZERO_BIGINT;
    i.lt(decimals as BigInt);
    i = i.plus(BigInt.fromI32(1))
  ) {
    denominator = denominator.times(BigDecimal.fromString('10'));
  }
  return bigInt.toBigDecimal().div(denominator);
}

export function bigDecimalizeToken(
  bigInt: BigInt,
  addressStr: string
): BigDecimal {
  return convertBigIntToBigDecimal(
    bigInt,
    getToken(Address.fromString(addressStr)).decimals
  );
}

import {
  Address,
  BigInt,
  BigDecimal,
  ethereum,
  log,
} from '@graphprotocol/graph-ts';
import { Token, Transaction } from '../../generated/schema';
import { ERC20 } from '../../generated/OptionFactory/ERC20';
import {
  BIGDECIMAL_ONE,
  BIGINT_ZERO,
  BIGINT_ONE,
  orderTypePriority,
} from './constants';

export function getToken(tokenAddr: Address): Token {
  let token = Token.load(tokenAddr.toHexString());
  if (token === null) {
    token = new Token(tokenAddr.toHexString());
    token.symbol = 'unknown';
    token.name = 'unknown';
    token.decimals = BIGINT_ZERO;
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

export function convertBigIntToBigDecimal(
  bigInt: BigInt,
  decimals: BigInt
): BigDecimal {
  // preventing div by zero
  if (decimals.equals(BIGINT_ZERO)) {
    return bigInt.toBigDecimal();
  }
  // creating 10^decimals
  let denominator = BIGDECIMAL_ONE;
  for (let i = BIGINT_ZERO; i.lt(decimals as BigInt); i = i.plus(BIGINT_ONE)) {
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

export function recordTransaction(
  hash: string,
  blockNumber: BigInt,
  timestamp: BigInt,
  factory: string,
  market: string,
  option: string,
  orderType: string
): void {
  if (orderTypePriority.indexOf(orderType) == -1) {
    log.debug('customlogs: invalid orderType {}', [orderType]);
    return;
  }

  let tx = Transaction.load(hash);
  if (tx === null) {
    tx = new Transaction(hash);
    tx.orderType = 'NONE';
    tx.internalOrders = [];
    tx.blockNumber = blockNumber;
    tx.timestamp = timestamp;
    tx.factory = factory;
    tx.market = market;
    tx.option = option;
  }
  if (
    orderTypePriority.indexOf(orderType) >
    orderTypePriority.indexOf(tx.orderType)
  ) {
    tx.orderType = orderType;
  }
  if (!tx.internalOrders.includes(orderType)) {
    tx.internalOrders.push(orderType);
  }
  tx.save();
}

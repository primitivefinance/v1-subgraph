import { Address, BigInt, BigDecimal, log } from '@graphprotocol/graph-ts';
import {
  LiquidityPosition,
  Token,
  TokenBalance,
  Transaction,
  UniswapPair,
  User,
} from '../../generated/schema';
import { ERC20 } from '../../generated/OptionFactory/ERC20';
import {
  BIGDECIMAL_ONE,
  BIGINT_ZERO,
  BIGINT_ONE,
  ORDER_TYPE_PRIORITY,
  ADDRESS_ZERO,
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
  if (ORDER_TYPE_PRIORITY.indexOf(orderType) == -1) {
    log.debug('customlogs: invalid orderType {}', [orderType]);
    return;
  }

  let tx = Transaction.load(hash);
  if (tx === null) {
    tx = new Transaction(hash);
    tx.orderType = 'NONE';
    tx.internalOrders = new Array<string>(0);
    tx.blockNumber = blockNumber;
    tx.timestamp = timestamp;
    tx.factory = factory;
    tx.market = market;
    tx.option = option;
  }
  if (
    ORDER_TYPE_PRIORITY.indexOf(orderType) >
    ORDER_TYPE_PRIORITY.indexOf(tx.orderType)
  ) {
    tx.orderType = orderType;
  }
  let _internalOrders = tx.internalOrders;
  if (!_internalOrders.includes(orderType)) {
    _internalOrders.push(orderType);
    tx.internalOrders = _internalOrders;
  }
  tx.save();
}

export function linkUserWithTransaction(
  userAddr: string,
  txHash: string
): void {
  let user = User.load(userAddr);
  if (user === null) {
    user = new User(userAddr);
    user.save();
  }
  let transaction = Transaction.load(txHash);
  if (transaction !== null && transaction.user === null) {
    transaction.user = userAddr;
  }
}

export function updateTokenBalance(
  tokenAddr: Address,
  userAddr: Address
): void {
  let user = User.load(userAddr.toHexString());
  if (user === null) {
    user = new User(userAddr.toHexString());
    user.save();
  }

  let token = getToken(tokenAddr);

  let erc20Contract = ERC20.bind(tokenAddr);
  let result = erc20Contract.try_balanceOf(userAddr);
  if (!result.reverted) {
    let tokenBalance = TokenBalance.load(
      tokenAddr.toHexString() + '-' + userAddr.toHexString()
    );
    if (tokenBalance === null) {
      tokenBalance = new TokenBalance(
        tokenAddr.toHexString() + '-' + userAddr.toHexString()
      );
      tokenBalance.token = token.id;
      tokenBalance.user = user.id;
    }
    tokenBalance.balance = convertBigIntToBigDecimal(
      result.value,
      token.decimals
    );
    tokenBalance.save();
  }
}

export function updateLiquidityPosition(
  pairAddr: Address,
  userAddr: Address
): void {
  if (userAddr.equals(ADDRESS_ZERO)) {
    return; // no-op for zero address
  }

  let user = User.load(userAddr.toHexString());
  if (user === null) {
    user = new User(userAddr.toHexString());
    user.save();
  }

  let uniswapPair = UniswapPair.load(pairAddr.toHexString());

  let erc20Contract = ERC20.bind(pairAddr);
  let result = erc20Contract.try_balanceOf(userAddr);
  if (!result.reverted) {
    let liquidityPosition = LiquidityPosition.load(
      pairAddr.toHexString() + '-' + userAddr.toHexString()
    );
    if (liquidityPosition === null) {
      // user is adding the liquidity for first time to this pair
      uniswapPair.liquidityProviderCount = uniswapPair.liquidityProviderCount.plus(
        BIGINT_ONE
      );
      uniswapPair.save();
      liquidityPosition = new LiquidityPosition(
        pairAddr.toHexString() + '-' + userAddr.toHexString()
      );
    }
    liquidityPosition.liquidityTokenBalance = convertBigIntToBigDecimal(
      result.value,
      BigInt.fromI32(18)
    );
    liquidityPosition.option = uniswapPair.option;
    liquidityPosition.uniswapPair = uniswapPair.id;
    liquidityPosition.user = user.id;
    liquidityPosition.save();
  }
}

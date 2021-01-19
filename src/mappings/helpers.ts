import { Address, BigInt, BigDecimal, log } from '@graphprotocol/graph-ts';
import {
  LiquidityPosition,
  OptionPosition,
  Token,
  TokenBalance,
  Transaction,
  UniswapPair,
  Option,
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

/**
 * Creates Token entity if not exist and populate symbol, name and decimal values
 * @param tokenAddr ERC20 token address
 */
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

/**
 * Useful to convert uint256 values into user friendly decimal point
 * @param bigInt a uint256 value from smart contract
 * @param decimals number of decimals to divide
 */
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

/**
 * Extends convertBigIntToBigDecimal to accept an ERC20 token address
 * @param bigInt a uint256 value from smart contract
 * @param addressStr ERC20 token address
 */
export function bigDecimalizeToken(
  bigInt: BigInt,
  addressStr: string
): BigDecimal {
  return convertBigIntToBigDecimal(
    bigInt,
    getToken(Address.fromString(addressStr)).decimals
  );
}

/**
 * Adds given orderType to the internalOrders arr (if it isn't already present), and
 * updates Transaction.orderType if priority of given orderType is higher than existing value
 * @param hash tx hash
 * @param blockNumber
 * @param timestamp
 * @param factory address of factory contract
 * @param market id of market entity
 * @param option address of option
 * @param orderType valid order type string (see constants.ts)
 */
export function recordTransaction(
  hash: string,
  blockNumber: BigInt,
  timestamp: BigInt,
  factory: string,
  market: string,
  option: string,
  orderType: string
): void {
  // catch accidental spelling mistakes in the graph logs
  if (ORDER_TYPE_PRIORITY.indexOf(orderType) == -1) {
    log.debug('customlogs: invalid orderType {}', [orderType]);
    return;
  }

  // create Transaction entity if it doesn't exist already
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

  // update Transaction.orderType if priority of given orderType is higher
  if (
    ORDER_TYPE_PRIORITY.indexOf(orderType) >
    ORDER_TYPE_PRIORITY.indexOf(tx.orderType)
  ) {
    tx.orderType = orderType;
  }

  // push given orderType to the internalOrders array
  let _internalOrders = tx.internalOrders;
  if (!_internalOrders.includes(orderType)) {
    _internalOrders.push(orderType);
    tx.internalOrders = _internalOrders;
  }
  tx.save();
}

/**
 * Creates a user if not exist and links their id to Transaction
 * @param userAddr Address of an account
 * @param txHash Transaction hash
 */
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

/**
 * Updates ERC20 token balance of a given wallet address on the TokenBalance entity
 * @param tokenAddr ERC20 token contract address
 * @param userAddr wallet address
 */
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

/**
 * Pretty much same as updateTokenBalance
 * This updates LP token balances
 * @param pairAddr Uniswap Pair contract address
 * @param userAddr wallet address
 */
export function updateLiquidityPosition(
  pairAddr: Address,
  userAddr: Address
): void {
  if (userAddr.equals(ADDRESS_ZERO)) {
    return; // no-op for zero address
  }

  // creating user if not exists
  let user = User.load(userAddr.toHexString());
  if (user === null) {
    user = new User(userAddr.toHexString());
    user.save();
  }

  let uniswapPair = UniswapPair.load(pairAddr.toHexString());

  // making a balanceOf call to the uniswap pair address
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
      liquidityPosition.option = uniswapPair.option;
      liquidityPosition.uniswapPair = uniswapPair.id;
      liquidityPosition.user = user.id;
    }
    liquidityPosition.liquidityTokenBalance = convertBigIntToBigDecimal(
      result.value,
      BigInt.fromI32(18)
    );
    liquidityPosition.save();
  }
}

/**
 * Pretty much same as updateTokenBalance
 * This updates Option and Redeem token balances
 * @param optionAddr Option contract address
 * @param userAddr wallet address
 */
export function updateOptionPosition(
  optionAddr: Address,
  userAddr: Address
): void {
  if (userAddr.equals(ADDRESS_ZERO)) {
    return; // no-op for zero address
  }

  // creating user if not exists
  let user = User.load(userAddr.toHexString());
  if (user === null) {
    user = new User(userAddr.toHexString());
    user.save();
  }

  let option = Option.load(optionAddr.toHexString());

  // making a balanceOf call to the option contract address
  let optionErc20Contract = ERC20.bind(optionAddr);
  let optionBalResResult = optionErc20Contract.try_balanceOf(userAddr);
  if (!optionBalResResult.reverted) {
    let optionPosition = OptionPosition.load(
      optionAddr.toHexString() + '-' + userAddr.toHexString()
    );
    if (optionPosition === null) {
      // user is creating option for first time to this pair
      optionPosition = new OptionPosition(
        optionAddr.toHexString() + '-' + userAddr.toHexString()
      );
      optionPosition.option = option.id;
      optionPosition.uniswapPair = option.uniswapPair;
      optionPosition.user = user.id;
      optionPosition.positionType = 'NONE';
    }
    optionPosition.longBalance = convertBigIntToBigDecimal(
      optionBalResResult.value,
      BigInt.fromI32(18)
    );
    // making a balanceOf call to the redeem contract address
    let redeemErc20Contract = ERC20.bind(Address.fromString(option.shortToken));
    let redeemBalResResult = redeemErc20Contract.try_balanceOf(userAddr);
    if (redeemBalResResult.reverted) {
      optionPosition.shortBalance = convertBigIntToBigDecimal(
        redeemBalResResult.value,
        BigInt.fromI32(18)
      );
      optionPosition.save();
    }
  }
}

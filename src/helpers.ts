import { OptionFactory, Option, Token } from '../generated/schema';
import { Option as OptionContract } from '../generated/OptionFactory/Option';
import { ERC20 } from '../generated/OptionFactory/ERC20';
import { Address, BigInt } from '@graphprotocol/graph-ts';

export function getFactory(): OptionFactory {
  const factoryAddr = '0xa4accc3dff7bd0d07fa02e39cd12e1a62d15f90f'; // TODO: take this dynamically
  let factory = OptionFactory.load(factoryAddr);
  if (factory == null) {
    factory = new OptionFactory(factoryAddr);
    factory.optionCount = 0;
    factory.marketCount = 0;
    factory.txCount = BigInt.fromI32(0);
    factory.save();
  }
  return factory as OptionFactory;
}

export function getOption(optionAddr: Address): Option {
  let option = Option.load(optionAddr.toHexString());
  if (option == null) {
    option = new Option(optionAddr.toHexString());
    option.expiry = 0;
    let optionContract = OptionContract.bind(optionAddr);

    // registering underlying token
    let underlyingTokenAddrResult = optionContract.try_getUnderlyingTokenAddress();
    if (!underlyingTokenAddrResult.reverted) {
      option.underlyingToken = getToken(underlyingTokenAddrResult.value).id;
    }

    // registering strike token
    let strikeTokenAddrResult = optionContract.try_getStrikeTokenAddress();
    if (!strikeTokenAddrResult.reverted) {
      option.strikeToken = getToken(strikeTokenAddrResult.value).id;
    }

    // registering option token
    {
      let token = getToken(optionAddr);
      token.kind = 'OPTION';
      token.save();
    }

    // registering redeem token
    let redeemTokenAddrResult = optionContract.try_redeemToken();
    if (!redeemTokenAddrResult.reverted) {
      let token = getToken(redeemTokenAddrResult.value);
      option.redeemToken = token.id;
      token.kind = 'REDEEM';
      token.save();
    }

    // this would revert and stop indexer if underlyingToken and strikeToken are not set.
    option.save();
  }
  return option as Option;
}

export function getToken(tokenAddr: Address): Token {
  let token = Token.load(tokenAddr.toHexString());
  if (token == null) {
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

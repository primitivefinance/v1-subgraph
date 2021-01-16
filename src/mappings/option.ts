import { Market, Option, Transaction } from '../../generated/schema';
import {
  UpdatedCacheBalances,
  Mint,
} from '../../generated/OptionFactory/Option';
import { bigDecimalizeToken, recordTransaction } from './helpers';

export function handleEvent_OptionUpdatedCacheBalances(
  event: UpdatedCacheBalances
): void {
  let option = Option.load(event.address.toHexString());
  let market = Market.load(option.market);
  let underlyingLockedOld = option.underlyingLocked;
  let strikeLockedOld = option.strikeLocked;

  let underlyingLockedNew = bigDecimalizeToken(
    event.params.underlyingCache,
    option.underlyingToken
  );
  let strikeCacheNew = bigDecimalizeToken(
    event.params.strikeCache,
    option.strikeToken
  );

  option.underlyingLocked = underlyingLockedNew;
  option.strikeLocked = strikeCacheNew;
  option.save();

  market.totalUnderlyingLocked = market.totalUnderlyingLocked
    .minus(underlyingLockedOld)
    .plus(underlyingLockedNew);
  market.totalStrikeLocked = market.totalStrikeLocked
    .minus(strikeLockedOld)
    .plus(strikeCacheNew);
  market.save();
}

export function handleEvent_OptionMint(event: Mint): void {
  let option = Option.load(event.address.toHexString());
  recordTransaction(
    event.transaction.hash.toHexString(),
    event.block.number,
    event.block.timestamp,
    option.factory,
    option.market,
    event.address.toHexString(),
    'MINT'
  );
}

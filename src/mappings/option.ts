import { Market, Option } from '../../generated/schema';
import { UpdatedCacheBalances } from '../../generated/OptionFactory/Option';
import { bigDecimalizeToken } from './helpers';

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

import { BigInt } from "@graphprotocol/graph-ts";
import {
  Mint,
  Swap,
  Redeem,
  Close,
  Fund,
} from "../generated/primeOption/primeOption";
import {
  MintEventOption,
  SwapEventOption,
  RedeemEventOption,
  CloseEventOption,
  FundEventOption,
} from "../generated/schema";

export function handleMint(event: Mint): void {
  let entity = new MintEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.outTokenP = event.params.outTokenP;
  entity.outTokenR = event.params.outTokenR;
  entity.hash = event.transaction.hash.toHex();
  entity.save();
}

export function handleSwap(event: Swap): void {
  let entity = new SwapEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.outTokenU = event.params.outTokenU;
  entity.inTokenS = event.params.inTokenS;
  entity.hash = event.transaction.hash.toHex();
  entity.save();
}

export function handleRedeem(event: Redeem): void {
  let entity = new RedeemEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.inTokenR = event.params.inTokenR;
  entity.hash = event.transaction.hash.toHex();
  entity.save();
}

export function handleClose(event: Close): void {
  let entity = new CloseEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.inTokenP = event.params.inTokenP;
  entity.hash = event.transaction.hash.toHex();
  entity.save();
}

export function handleFund(event: Fund): void {
  let entity = new FundEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.cacheU = event.params.cacheU;
  entity.cacheS = event.params.cacheS;
  entity.cacheR = event.params.cacheR;
  entity.hash = event.transaction.hash.toHex();
  entity.save();
}

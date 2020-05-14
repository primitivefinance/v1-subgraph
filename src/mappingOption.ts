import { BigInt } from "@graphprotocol/graph-ts";
import {
  primeOption,
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
  let contract = primeOption.bind(event.address);
  entity.from = event.params.from;
  entity.outTokenP = event.params.outTokenP;
  entity.outTokenR = event.params.outTokenR;
  // Transacation / Block Data
  entity.hash = event.transaction.hash.toHex();
  // State Variables.
  entity.name = contract.name();
  entity.expiry = contract.expiry();
  entity.decimals = BigInt.fromI32(contract.decimals());
  entity.cacheS = contract.cacheS();
  entity.cacheU = contract.cacheU();
  entity.cacheR = contract.cacheR();
  entity.marketId = contract.marketId();
  entity.maxDraw = contract.maxDraw();
  entity.price = contract.price();
  entity.tokenRAddress = contract.tokenR();
  entity.tokenSAddress = contract.tokenS();
  entity.tokenUAddress = contract.tokenU();
  entity.symbol = contract.symbol();
  entity.base = contract.base();
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
  let contract = primeOption.bind(event.address);
  // State Variables.
  entity.name = contract.name();
  entity.expiry = contract.expiry();
  entity.decimals = BigInt.fromI32(contract.decimals());
  entity.cacheS = contract.cacheS();
  entity.cacheU = contract.cacheU();
  entity.cacheR = contract.cacheR();
  entity.marketId = contract.marketId();
  entity.maxDraw = contract.maxDraw();
  entity.price = contract.price();
  entity.tokenRAddress = contract.tokenR();
  entity.tokenSAddress = contract.tokenS();
  entity.tokenUAddress = contract.tokenU();
  entity.symbol = contract.symbol();
  entity.base = contract.base();

  entity.save();
}

export function handleRedeem(event: Redeem): void {
  let entity = new RedeemEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.inTokenR = event.params.inTokenR;
  entity.hash = event.transaction.hash.toHex();
  let contract = primeOption.bind(event.address);
  // State Variables.
  entity.name = contract.name();
  entity.expiry = contract.expiry();
  entity.decimals = BigInt.fromI32(contract.decimals());
  entity.cacheS = contract.cacheS();
  entity.cacheU = contract.cacheU();
  entity.cacheR = contract.cacheR();
  entity.marketId = contract.marketId();
  entity.maxDraw = contract.maxDraw();
  entity.price = contract.price();
  entity.tokenRAddress = contract.tokenR();
  entity.tokenSAddress = contract.tokenS();
  entity.tokenUAddress = contract.tokenU();
  entity.symbol = contract.symbol();
  entity.base = contract.base();
  entity.save();
}

export function handleClose(event: Close): void {
  let entity = new CloseEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.inTokenP = event.params.inTokenP;
  entity.hash = event.transaction.hash.toHex();
  let contract = primeOption.bind(event.address);
  // State Variables.
  entity.name = contract.name();
  entity.expiry = contract.expiry();
  entity.decimals = BigInt.fromI32(contract.decimals());
  entity.cacheS = contract.cacheS();
  entity.cacheU = contract.cacheU();
  entity.cacheR = contract.cacheR();
  entity.marketId = contract.marketId();
  entity.maxDraw = contract.maxDraw();
  entity.price = contract.price();
  entity.tokenRAddress = contract.tokenR();
  entity.tokenSAddress = contract.tokenS();
  entity.tokenUAddress = contract.tokenU();
  entity.symbol = contract.symbol();
  entity.base = contract.base();
  entity.save();
}

export function handleFund(event: Fund): void {
  let entity = new FundEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.cacheUEvent = event.params.cacheU;
  entity.cacheSEvent = event.params.cacheS;
  entity.cacheREvent = event.params.cacheR;
  entity.hash = event.transaction.hash.toHex();
  let contract = primeOption.bind(event.address);
  // State Variables.
  entity.name = contract.name();
  entity.expiry = contract.expiry();
  entity.decimals = BigInt.fromI32(contract.decimals());
  entity.cacheS = contract.cacheS();
  entity.cacheU = contract.cacheU();
  entity.cacheR = contract.cacheR();
  entity.marketId = contract.marketId();
  entity.maxDraw = contract.maxDraw();
  entity.price = contract.price();
  entity.tokenRAddress = contract.tokenR();
  entity.tokenSAddress = contract.tokenS();
  entity.tokenUAddress = contract.tokenU();
  entity.symbol = contract.symbol();
  entity.base = contract.base();
  entity.save();
}

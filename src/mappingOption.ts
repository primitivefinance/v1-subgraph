import { BigInt } from "@graphprotocol/graph-ts";
import { Mint } from "../generated/primeOption/primeOption";
import { MintEventOption } from "../generated/schema";

export function handleMint(event: Mint): void {
  let entity = new MintEventOption(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.from;
  entity.outTokenP = event.params.outTokenP;
  entity.outTokenR = event.params.outTokenR;
  entity.save();
}

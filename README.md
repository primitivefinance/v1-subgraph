# primitive-subgraph

A graph for the Primitive Protocol.

1. Initiate Graph Repo `graph init --from-contract 0xf7a7126C6eB9c2cC0dB9F936bA4d0D5685662830 --network mainnet pd164594/primitivepool`
2. Authenticate for deployment `graph auth https://api.thegraph.com/deploy/ <access-token>`
3. Set starting block in `subgraph.yaml` file so it knows where to begin indexing. `startBlock: 9978493` for the Pool COntract.
4. Define Data structure in `schema.graphql`.
5. Update functions in `src/mapping.ts`
6. https://thegraph.com/explorer/subgraph/pd164594/primitivepool -testing environment for deploy graph. Not public yet.


# Cardano Simple Vesting DApp

This is a Haskell/Plutus smart contract for a simple vesting scheme where a beneficiary can claim funds only after a deadline.

## Project Structure
- `src/VestingContract.hs`: On-chain validator logic.
- `app/Compiler.hs`: Serializes the script for use with cardano-cli.
- `simple-vesting.cabal`: Build configuration.

## Requirements
- GHC 8.10.7 (standard for Plutus)
- Cabal
- Plutus libraries (recommended to build with nix-shell)

## How to Compile
1. Run `cabal build` to compile the library and the executable.
2. Run `cabal run compiler` to generate the `vesting.plutus` file.
3. This JSON file can be used with `cardano-cli` to submit transactions.

## Transaction Logic
- **Locking**: Create a transaction output to the script address with the `VestingDatum` (beneficiary address and deadline unix timestamp).
- **Claiming**: Create a transaction spending the script UTxO, signed by the beneficiary, after the POSIX deadline.

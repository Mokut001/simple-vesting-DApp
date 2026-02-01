
{-# LANGUAGE OverloadedStrings #-}

module Main where

import           Cardano.Api
import           Cardano.Api.Shelley   (PlutusScript (..))
import           Codec.Serialise       (serialise)
import qualified Data.ByteString.Lazy  as LBS
import qualified Data.ByteString.Short as SBS
import           VestingContract       (script)

-- Serialize the script to a file
main :: IO ()
main = do
    let scriptSBS = SBS.toShort . LBS.toStrict $ serialise script
        plutusScript = PlutusScriptSerialised scriptSBS :: PlutusScript PlutusScriptV2
    writeFileTextEnvelope "vesting.plutus" Nothing plutusScript >>= \case
        Left err -> print $ displayError err
        Right () -> putStrLn "Successfully wrote vesting.plutus"

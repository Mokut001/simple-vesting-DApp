
{-# LANGUAGE DataKinds           #-}
{-# LANGUAGE FlexibleContexts    #-}
{-# LANGUAGE NoImplicitPrelude   #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE TemplateHaskell     #-}
{-# LANGUAGE TypeApplications    #-}
{-# LANGUAGE TypeFamilies        #-}
{-# LANGUAGE TypeOperators       #-}

module VestingContract where

import           Plutus.V2.Ledger.Api
import           Plutus.V2.Ledger.Contexts
import           PlutusTx
import           PlutusTx.Prelude          hiding (Semigroup (..), unless)
import           Prelude                   (Show (..))

-- Datum: Beneficiary and Deadline
data VestingDatum = VestingDatum
    { beneficiary :: PubKeyHash
    , deadline    :: POSIXTime
    }

PlutusTx.unstableMakeIsData ''VestingDatum

{-# INLINABLE mkValidator #-}
mkValidator :: VestingDatum -> () -> ScriptContext -> Bool
mkValidator dat () ctx = 
    checkSignedByBeneficiary && 
    checkDeadlineReached
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    checkSignedByBeneficiary :: Bool
    checkSignedByBeneficiary = txSignedBy info (beneficiary dat)

    checkDeadlineReached :: Bool
    checkDeadlineReached = contains (from (deadline dat)) (txInfoValidRange info)

-- Validation Logic Boilerplate
validator :: Validator
validator = mkValidatorScript $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = mkUntypedValidator mkValidator

script :: Script
script = unValidatorScript validator

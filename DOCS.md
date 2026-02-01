# PHOENIX RECOVERY VAULT (v1.0)

A secure, autonomous Social Recovery / Deadman Switch protocol on Cardano.

## 🚀 THE CONCEPT
The Phoenix Vault is a multi-signature identity-based smart contract. It solves the "What if I lose my keys or die?" problem.

- **The Owner**: Can withdraw funds at any time.
- **The Successor (Heir)**: Can claim the funds ONLY if the specified "Deadman Trigger" date has passed.

## 🛠 SETUP
1. **Wallet**: Use **Eternl** or **Nami** extension.
2. **Network**: Switch your wallet to **Preprod Testnet**.
3. **Server**: Run via `Live Server` in VS Code or `python -m http.server`.
4. **Browser**: Open `http://localhost:[port]`.

## 🧪 HOW TO TEST
1. **Sync Wallet**: Click 'Authorize Bridge'.
2. **Setup Heir**: Paste another PKH (or your own for testing).
3. **Set Date**: For testing, set the date to 5 minutes from now.
4. **Deploy**: Confirm the TX. Your ADA is now locked.
5. **Withdraw as Owner**: You should be able to click 'Initiate Recovery' immediately since you are the owner.
6. **Test as Heir**: Have a friend (or another wallet) try to claim. They will fail until the date passes.

## 📁 FILE OVERVIEW
- `index.html`: High-end glassmorphic UI.
- `app.js`: Connects your browser wallet to the Smart Contract.
- `PhoenixVault.hs`: The Plutus V2 source code.

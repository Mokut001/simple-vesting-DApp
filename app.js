const BLOCKFROST_KEY = "preprodIb3LJHd44Ilolee1XVbQPRLS1eIAh1xb";
const SCRIPT_HEX = "5822582001000032323232323222253330044a2224410000014a22244100000100214a222441000001"; 

let lucid = null;

const notify = (m) => {
    document.getElementById("status").innerText = `SYSTEM :: ${m}`;
    console.log(m);
};

// -- CONNECT --
async function initWallet() {
    try {
        const L = window.Lucid.Lucid;
        const B = window.Lucid.Blockfrost;

        lucid = await L.new(
            new B("https://cardano-preprod.blockfrost.io/api/v0", BLOCKFROST_KEY),
            "Preprod"
        );

        if (!window.cardano?.eternl && !window.cardano?.nami) {
            throw new Error("No Cardano wallet detected. Install Eternl/Nami.");
        }

        const api = await (window.cardano.eternl || window.cardano.nami).enable();
        lucid.selectWallet(api);

        const addr = await lucid.wallet.address();
        document.getElementById("walletBtn").innerText = addr.slice(0, 15) + "...";
        notify("WALLET LINKED: " + addr.slice(0, 40));

        const sa = lucid.utils.validatorToAddress({ type: "PlutusV2", script: SCRIPT_HEX });
        document.getElementById("contractRef").innerText = `SC_ADDR: ${sa}`;

        refreshGrid();
    } catch (e) { notify(e.message); }
}

// -- DEPLOY --
async function deployPhoenix() {
    try {
        if (!lucid) await initWallet();
        
        const successor = document.getElementById("heirPkh").value;
        const dateRaw = document.getElementById("releaseDate").value;
        const amount = document.getElementById("adaAmount").value;
        
        const myAddr = await lucid.wallet.address();
        const myPkh = lucid.utils.getAddressDetails(myAddr).paymentCredential.hash;

        if (!successor || !dateRaw || !amount) throw new Error("Complete parameter sequence.");

        notify("Building Phoenix Vault UTXO...");
        const releaseTime = new Date(dateRaw).getTime();
        
        // Datum: [OwnerPKH, SuccessorPKH, ReleaseTimestamp]
        const datum = window.Lucid.Data.to([myPkh, successor, BigInt(releaseTime)]);
        const scriptAddr = lucid.utils.validatorToAddress({ type: "PlutusV2", script: SCRIPT_HEX });

        const tx = await lucid.newTx()
            .payToContract(scriptAddr, { inline: datum }, { lovelace: BigInt(amount * 1000000) })
            .complete();

        const signed = await tx.sign().complete();
        const hash = await signed.submit();
        
        notify("VAULT BORN: " + hash);
        alert("Phoenix Vault Sealed! Hash: " + hash);
        refreshGrid();
    } catch (e) { notify(e.message); }
}

// -- READ --
async function refreshGrid() {
    const grid = document.getElementById("vaultGrid");
    try {
        if (!lucid) return;
        notify("Refreshing Ledger State...");

        const sa = lucid.utils.validatorToAddress({ type: "PlutusV2", script: SCRIPT_HEX });
        const utxos = await lucid.utxosAt(sa);

        if (utxos.length === 0) {
            grid.innerHTML = '<div class="glass p-16 text-center rounded-[3rem] text-zinc-800 text-xs italic">The ledger has no Phoenix Vaults at this sector.</div>';
            return;
        }

        grid.innerHTML = "";
        utxos.forEach(u => {
            const datum = window.Lucid.Data.from(u.datum);
            const [owner, successor, releaseTime] = datum;
            const unlockDateStr = new Date(Number(releaseTime)).toLocaleString();

            const card = document.createElement("div");
            card.className = "glass p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-violet-500/30 transition-all";
            card.innerHTML = `
                <div class="space-y-1">
                    <p class="text-[8px] text-zinc-500 uppercase font-black">Successor PKH</p>
                    <p class="text-[10px] font-mono text-zinc-300">${successor.slice(0, 20)}...</p>
                    <p class="text-2xl font-black orbitron text-violet-400">${Number(u.assets.lovelace)/1000000} ADA</p>
                    <p class="text-[9px] text-zinc-500 font-bold uppercase mt-2">Claim Date: ${unlockDateStr}</p>
                </div>
                <button onclick="attemptRecovery('${u.txHash}', '${u.outputIndex}')" class="bg-zinc-900 border border-zinc-800 hover:border-violet-500 text-zinc-200 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Initiate Recovery
                </button>
            `;
            grid.appendChild(card);
        });
        notify("LEDGER SYNC COMPLETE.");
    } catch (e) { notify(e.message); }
}

// -- RECOVER --
async function attemptRecovery(txHash, index) {
    try {
        notify("Verifying identity on-chain...");
        const utxo = (await lucid.utxosByOutRef([{ txHash, outputIndex: parseInt(index) }]))[0];
        const script = { type: "PlutusV2", script: SCRIPT_HEX };
        
        const tx = await lucid.newTx()
            .collectFrom([utxo], window.Lucid.Data.empty())
            .attachSpendingValidator(script)
            .validFrom(Date.now() - 60000)
            .complete();

        const signed = await tx.sign().complete();
        const hash = await signed.submit();
        
        notify("RECOVERY SUCCESSFUL: " + hash);
        alert("Phoenix Assets Manifested in Wallet!\nTx: " + hash);
        refreshGrid();
    } catch (e) { 
        notify("ACCESS DENIED: Credentials or Time Constraint not met."); 
        console.error(e);
    }
}

window.onload = () => setTimeout(initWallet, 500);
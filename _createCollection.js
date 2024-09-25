import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
    generateSigner,
    keypairIdentity
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import fs from "fs";
  
  (async () => {

    if( process.argv[2] == null ){
        console.log('\tnode createCollection.js <Name>');
        return;
    }

    const name = process.argv.slice(2).join(' ');
  
    const umi = createUmi("https://api.devnet.solana.com")
        .use(mplCore())
        .use(
            irysUploader({
                // mainnet address: "https://node1.irys.xyz"
                // devnet address: "https://devnet.irys.xyz"
                address: "https://devnet.irys.xyz",
            })
        );

    const walletFile = JSON.parse(
        fs.readFileSync("./id.json")
    );

    let keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(walletFile)
    );

    umi.use(keypairIdentity(keypair));
  
    //
    // ** Creating the Collection **
    //
  
    const collection = generateSigner(umi)
  
    console.log('Creating Collection...')
    const tx = await createCollection(umi, {
      collection,
      name: name
    }).sendAndConfirm(umi);
  
    const signature = base58.deserialize(tx.signature)[0]
  
    console.log('\Collection Created')
    console.log('View Transaction on Solana Explorer')
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)
    console.log("\n");
    console.log("View NFT on Metaplex Explorer");
    console.log(`https://explorer.solana.com/address/${collection.publicKey}?cluster=devnet`);
})();

// % node createCollection.js LuckySet                
// Creating Collection...
// Collection Created
// View Transaction on Solana Explorer
// https://explorer.solana.com/tx/quf7aYaezeTKoR9HWs9fYqMArp6GXkHH5xE4pkGSywCpqzHkGnYD5ggWHohk2MHPtXbQPKdsbc9XKMxutFjKcd8?cluster=devnet

// quf7aYaezeTKoR9HWs9fYqMArp6GXkHH5xE4pkGSywCpqzHkGnYD5ggWHohk2MHPtXbQPKdsbc9XKMxutFjKcd8


// View NFT on Metaplex Explorer
// https://explorer.solana.com/address/AA3iQCFM2yiRyE4EvjsVmkByTkbk4SGAb43JFMfZ9vJe?cluster=devnet

// AA3iQCFM2yiRyE4EvjsVmkByTkbk4SGAb43JFMfZ9vJe
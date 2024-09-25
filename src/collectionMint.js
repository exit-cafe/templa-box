import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
    generateSigner,
    keypairIdentity
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import fs from "fs";
import { config } from "./config.js";


export const createCollectionByName = async (name) => {
  
    const umi = createUmi(config.server)
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
    console.log("View NFT on Metaplex Explorer");
    console.log(`https://explorer.solana.com/address/${collection.publicKey}?cluster=devnet`);

    return {
        "publicKey" : collection.publicKey,
        "signature" : signature,
        "name" : name
    };
}
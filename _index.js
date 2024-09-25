import { create, mplCore } from "@metaplex-foundation/mpl-core";
import {
    createGenericFile,
    generateSigner,
    keypairIdentity,
    signerIdentity,
    sol,
    publicKey
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import fs from "fs";
import path from "path";

import { 
    mintNFT,
    mintCollection,
    mintCoreNFT
} from "./src/createNFT.js";
// import {
//     createCollectionMint
// } from "./src/collectionMint.js";


// 実行例 (各関数を呼び出す)
(async () => {

    //
    // ** Setting Up Umi **
    //

    const umi = createUmi("https://api.devnet.solana.com")
        .use(mplCore())
        .use(
            irysUploader({
                // mainnet address: "https://node1.irys.xyz"
                // devnet address: "https://devnet.irys.xyz"
                address: "https://devnet.irys.xyz",
            })
        );

    //   こちらを自身のウォレットの格納場所に設定してください。
    const walletFile = JSON.parse(
        fs.readFileSync("./id.json")
    );

    let keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(walletFile)
    );

    umi.use(keypairIdentity(keypair));

    const imagePath = path.join("./image.png");

    // 1. Core NFTのMint
    const { irysImageUri, imageUri } = await mintNFT(umi, imagePath);

    // 2. CollectionのMint
    const collectionAddress = await mintCollection();

    // 3. Collectionに紐付けたNFTのMint
    await mintCoreNFT(umi, irysImageUri, imageUri, collectionAddress);
})();
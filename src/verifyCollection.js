import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
    mplTokenMetadata,
    verifyCollectionV1,
    findMetadataPda
} from '@metaplex-foundation/mpl-token-metadata'
import {
    keypairIdentity,
    generateSigner,
    publicKey,
    createSignerFromKeypair
} from "@metaplex-foundation/umi";
import { config } from "./config.js";
import fs from "fs";
import { createV1 } from '@metaplex-foundation/mpl-core';
import { base58 } from "@metaplex-foundation/umi/serializers";

export const verifyCollection = async (data, res) => {

    const contentMint = "FEVUGLka1dkb79aaa1iHiq37gik8BaEVjskB1fTDKMYX";
    const collectionMint = "APwGJfhw8L6yf3GCDHrMXaZjH2PhGyPPGzk1nkgppGSU";
    // const contentMint = data.contentMint ?? null;
    // const collectionMint = data.collectionMint ?? null;

    if( contentMint == null || collectionMint == null ){
        res.json({
            "status": false,
            "error": "No fields"
        });
        return;
    }

    const umi = createUmi(config.server).use(mplTokenMetadata());

    const walletFile = JSON.parse(
        fs.readFileSync("./id.json")
    );

    const keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(walletFile)
    );

    umi.use(keypairIdentity(keypair));
    
    // const transaction = await verifyCollectionV1(umi, {
    //     authority: createSignerFromKeypair(umi, keypair),
    //     metadata: findMetadataPda(umi, { mint: contentMint }),
    //     collectionMint: collectionMint,
    // })
    
    
    // transaction.sendAndConfirm(umi);

    const asset = generateSigner(umi);
    const result = await createV1(umi, {
        asset,
        name: 'My Core NFT',
        uri: 'https://arweave.net/IjF_Sd0zcvGwTbkfFjPFoiHlmVPn7duJ1diU92OZHKo',
        collection: publicKey(collectionMint),
        authority: createSignerFromKeypair(umi, keypair)
      }).sendAndConfirm(umi);
    
      console.log('payer =>', keypair.publicKey.toString());
      console.log('asset =>', asset.publicKey.toString());
      console.log('signature =>', base58.deserialize(result.signature)[0]);
    res.json({
        status: true
    });
    return;
}
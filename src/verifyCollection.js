import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
    mplTokenMetadata,
    verifyCollectionV1, 
    findMetadataPda
} from '@metaplex-foundation/mpl-token-metadata'
import {
    keypairIdentity
} from "@metaplex-foundation/umi";

import { config } from "./config.js";
import fs from "fs";

export const verifyCollection = async (data, res) => {

    const contentMint = "FEVUGLka1dkb79aaa1iHiq37gik8BaEVjskB1fTDKMYX";
    const collectionMint = "GMferzDpa5EGgyBgc1SFQxVdWQn4XvdFbEWa3QKSYvMB";
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
    
    const transaction = await verifyCollectionV1(umi, {
        metadata: findMetadataPda(umi, { mint: contentMint }),
        collectionMint: collectionMint,
        authority: umi.identity,
    })
    
    transaction.sendAndConfirm(umi);

    return;
}
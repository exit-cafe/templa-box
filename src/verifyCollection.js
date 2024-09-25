import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from "@metaplex-foundation/mpl-core";
import { verifyCollectionV1, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata'
import {
    keypairIdentity,
    publicKey,
    generateSigner
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

    const umi = createUmi(config.server)
        .use(mplCore());

    const walletFile = JSON.parse(
        fs.readFileSync("./id.json")
    );

    let keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(walletFile)
    );

    umi.use(keypairIdentity(keypair));
    

    const metadata = findMetadataPda(umi, {
        mint: publicKey(contentMint)
    });

    const collectionAuthority = generateSigner(umi);

    await verifyCollectionV1(umi, {
        metadata,
        collectionMint,
        authority: collectionAuthority
    }).sendAndConfirm(umi);

    return;
}
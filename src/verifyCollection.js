import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
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
import { mplCore, updateV1 } from '@metaplex-foundation/mpl-core';
import fetch from 'node-fetch';
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

export const verifyCollection = async (data, res) => {

    // const contentMint = "FEVUGLka1dkb79aaa1iHiq37gik8BaEVjskB1fTDKMYX";
    // const collectionMint = "APwGJfhw8L6yf3GCDHrMXaZjH2PhGyPPGzk1nkgppGSU";
    const contentMint = data.contentMint ?? null;
    const collectionMint = data.collectionMint ?? null;

    if (contentMint == null || collectionMint == null) {
        res.json({
            "status": false,
            "error": "No fields"
        });
        return;
    }
    
    const umi = createUmi(config.server)
        .use(mplTokenMetadata())
        .use(mplCore())
        .use(dasApi())
        .use(
            irysUploader({
                // mainnet address: "https://node1.irys.xyz"
                // devnet address: "https://devnet.irys.xyz"
                address: "https://devnet.irys.xyz",
            })
        );

    const keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(config.wallet)
    );

    umi.use(keypairIdentity(keypair));

    const asset = await umi.rpc.getAsset(contentMint);

    if( asset.content.json_uri == null ){
        res.json({
            status: false
        });
        return;
    }

    const response = await fetch(asset.content.json_uri);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const metadata = await response.json();
    
    metadata.collection = {
        key: collectionMint,
        version: false
    }

    console.log("Uploading Metadata...");
    const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
        throw new Error(err);
    });

    // Replace the Arweave gateway part with the Irys gateway
    const irysMetadataUri = metadataUri.replace(
        "arweave.net",
        "gateway.irys.xyz"
    );

    console.log("metadataUri: " + irysMetadataUri);

    await updateV1(umi, {
        mint: generateSigner(umi),
        metadata: findMetadataPda(umi, { mint : publicKey(contentMint) }),
        updateAuthority: umi.identity,
        data: {
            uri: irysMetadataUri
        },
        authority: createSignerFromKeypair(umi, keypair)
    }).sendAndConfirm(umi);

    await verifyCollectionV1(umi, {
        metadata: metadataPda,
        collectionMint: collectionMint,
        authority: createSignerFromKeypair(umi, keypair)
    }).sendAndConfirm(umi);

    // const authority = createSignerFromKeypair(umi, keypair);

    // const transaction = await verifyCollectionV1(umi, {
    //     authority,
    //     // metadata: findMetadataPda(umi, { mint: contentMint }),
    //     metadata: contentMint,
    //     collectionMint: collectionMint,
    //     // collectionMint: publicKey(collectionMint),
    // })

    // transaction.sendAndConfirm(umi);

    // const asset = generateSigner(umi);
    // const result = await createV1(umi, {
    //     asset,
    //     name: 'My Core NFT',
    //     uri: 'https://arweave.net/IjF_Sd0zcvGwTbkfFjPFoiHlmVPn7duJ1diU92OZHKo',
    //     collection: publicKey(collectionMint),
    //     authority: createSignerFromKeypair(umi, keypair)
    //   }).sendAndConfirm(umi);

    //   console.log('payer =>', keypair.publicKey.toString());
    //   console.log('asset =>', asset.publicKey.toString());
    //   console.log('signature =>', base58.deserialize(result.signature)[0]);
    res.json({
        status: true
    });
    return;
}
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createV1, mplCore } from "@metaplex-foundation/mpl-core";
import {
    publicKey,
    generateSigner,
    transactionBuilder,
    keypairIdentity,
    some,
    sol,
    dateTime,
    createGenericFile,
    signerIdentity,
    createSignerFromKeypair
} from '@metaplex-foundation/umi';

import {
      verifyCollectionV1,
      findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { base58 } from "@metaplex-foundation/umi/serializers";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import fs from "fs";
import { config } from "./config.js";
import path from "path";

const options = {
    send: { skipPreflight: true },
    confirm: { commitment: 'processed' }
};

export const createCoreNFTMint = async (data, res) => {

    var collectionAddress = data.collection ?? null;
    const file = data.file ?? null;
    const name = data.name ?? null;
    const description = data.description ?? null;
    const attributes = data.attributes ?? null;
    const external_url = data.external_url ?? null;
    
    if( collectionAddress == "" ) collectionAddress = null;

    if( 
        file == null || 
        name == null
    ){
        res.json({
            "status": false,
            "error": "No fields"
        });
        return;
    }

    const umi = createUmi(config.server)
        .use(mplCore())
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

    const imageFilePath = path.resolve(file);
    const imageFile = fs.readFileSync(imageFilePath);
    const imageName = path.basename(imageFilePath);

    const umiImageFile = createGenericFile(imageFile, imageName, {
        tags: [{ name: "Content-Type", value: "image/png" }],
    });

    console.log("Uploading Image... : " + imageName);

    const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
        throw new Error(err);
    });

    const irysImageUri = imageUri[0].replace("arweave.net", "gateway.irys.xyz");
    
    console.log("imageUri: " + irysImageUri);
    
    const metadata = {
        name: name,
        description: description,
        image: irysImageUri,
        external_url: external_url,
        attributes: attributes,
        properties: {
            files: [
                {
                    uri: imageUri[0],
                    type: "image/png",
                },
            ],
            category: "image",
        }
    };

    if( collectionAddress != null ){
        metadata.collection = {
            key: collectionAddress,
            version: false
        }
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

    //
    // ** Creating the NFT **
    //

    // We generate a signer for the NFT
    const asset = generateSigner(umi);

    console.log("Creating NFT...");

    const createData = {
        asset,
        name: data.name,
        uri: irysMetadataUri,
        authority: createSignerFromKeypair(umi, keypair)
    };

    if( collectionAddress != null ){
        createData.collection = publicKey(collectionAddress);
    }

    const tx = await createV1(umi, createData).sendAndConfirm(umi);

    // Finally we can deserialize the signature that we can check on chain.
    const signature = base58.deserialize(tx.signature)[0];

    // Log out the signature and the links to the transaction and the NFT.
    console.log("\nNFT Created");
    console.log("View Transaction on Solana Explorer");
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("\n");
    console.log("View NFT on Metaplex Explorer");
    console.log(
        `https://core.metaplex.com/explorer/${asset.publicKey}?env=devnet`
    );

    console.log("verifyCollection ok");

    res.json({
        status: true
    });
    return;
}
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import {
    publicKey,
    generateSigner,
    transactionBuilder,
    keypairIdentity,
    some,
    sol,
    dateTime,
    createGenericFile,
    signerIdentity
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

    const collectionAddress = data.collection ?? null;
    const file = data.file ?? null;
    const name = data.name ?? null;

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

    const walletFile = JSON.parse(
        fs.readFileSync("./id.json")
    );

    let keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(walletFile)
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
        name: data.name,
        description: data.description,
        image: irysImageUri,
        external_url: data.external_url,
        attributes: data.attributes,
        properties: {
            files: [
                {
                    uri: imageUri[0],
                    type: "image/png",
                },
            ],
            category: "image",
        },
    };

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
    const tx = await create(umi, {
        asset,
        name: data.name,
        uri: irysMetadataUri,
        collection: collectionAddress,
        collectionUpdateAuthority: umi.identity,
        authority: umi.identity.publicKey,
    }).sendAndConfirm(umi);

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

    const md = findMetadataPda(umi, { 
        mint: publicKey(asset.publicKey)
      });

    await verifyCollectionV1(umi, {
        metadata: md,
        collectionMint: collectionAddress,
        authority: umi.identity.publicKey,
    }).sendAndConfirm(umi);

    console.log("verifyCollection ok");

    res.json({
        status: true
    });
    return;
}
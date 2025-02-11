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

// 1. Metaplex Core NFTをMintする
export const mintNFT = async (umi, imagePath) => {

    //
    // ** Upload an image to Arweave **
    //

    // use `fs` to read file via a string path.
    // You will need to understand the concept of pathing from a computing perspective.

    const imageFile = fs.readFileSync(path.join("./image.png"));

    // Use `createGenericFile` to transform the file into a `GenericFile` type
    // that umi can understand. Make sure you set the mimi tag type correctly
    // otherwise Arweave will not know how to display your image.

    const umiImageFile = createGenericFile(imageFile, "image.png", {
        tags: [{ name: "Content-Type", value: "image/png" }],
    });

    // Here we upload the image to Arweave via Irys and we get returned a uri
    // address where the file is located. You can log this out but as the
    // uploader can takes an array of files it also returns an array of uris.
    // To get the uri we want we can call index [0] in the array.
    console.log("Uploading Image...");
    const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
        throw new Error(err);
    });

    // Replace the Arweave gateway part with the Irys gateway
    const irysImageUri = imageUri[0].replace("arweave.net", "gateway.irys.xyz");

    console.log("imageUri: " + irysImageUri);

    return { irysImageUri, imageUri };
};

// 2. Collection AddressをMintする
export const mintCollection = async () => {
    // const collectionMint = '4hdQmqkWwf9c4GhxcTHKnrxL4haycExqdr5fGGrZhLV8';
    const collectionMint = "G5EKaPY4Pvmkb5Cw8SjX479w3rsw4KU32D1tXqvvWhiZ";

    return collectionMint;
};

// 3. Collectionに紐づけたCore NFTをMintする
export const mintCoreNFT = async (umi, irysImageUri, imageUri, collectionAddress) => {

    const metadata = {
        name: "IAM",
        description: "This is an NFT on Solana",
        image: irysImageUri,
        external_url: "https://example.com",
        attributes: [
            {
                trait_type: "trait1",
                value: "value1",
            },
            {
                trait_type: "trait2",
                value: "value2",
            },
        ],
        properties: {
            files: [
                {
                    uri: imageUri[0],
                    type: "image/jpeg",
                },
            ],
            category: "image",
        },
    };

    // Call upon umi's `uploadJson` function to upload our metadata to Arweave via Irys.

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
        name: "IAM",
        uri: irysMetadataUri,
        collection: "BGURYGoimsP6knui5fDwuTtmDGRCM6KFxZZTFX7aGdDy",
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
};
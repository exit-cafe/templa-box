import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
    mplCandyMachine as mplCoreCandyMachine, create,
    addConfigLines,
    fetchCandyMachine,
    deleteCandyMachine,
    mintV1,
} from "@metaplex-foundation/mpl-core-candy-machine";
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
} from '@metaplex-foundation/umi';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import fs from "fs";
import { config } from "./config.js";
import path from "path";

const options = {
    send: { skipPreflight: true },
    confirm: { commitment: 'processed' }
};

export const createCoreNFTMint = async (data) => {

    const collectionAddress = data.collection ?? null;
    const contents = data.contents ?? null;

    if( contents == null || contents.length <= 0){
        return {
            "error": "No Contents"
        };
    }

    const umi = createUmi(config.server)
        .use(mplCoreCandyMachine())
        .use(
            irysUploader({
                // mainnet address: "https://node1.irys.xyz"
                // devnet address: "https://devnet.irys.xyz"
                address: "https://devnet.irys.xyz",
            })
        );

    const treasury = generateSigner(umi);
    const candyMachine = generateSigner(umi);

    const walletFile = JSON.parse(
        fs.readFileSync("./id.json")
    );

    let keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(walletFile)
    );

    umi.use(keypairIdentity(keypair));

    // Create a Candy Machine    
    try {
        const createIx = await create(umi, {
            candyMachine,
            collection: collectionAddress,
            collectionUpdateAuthority: umi.identity,
            itemsAvailable: 3,
            authority: umi.identity.publicKey,
            isMutable: false,
            configLineSettings: some({
                prefixName: '',
                nameLength: 0,
                prefixUri: '',
                uriLength: 0,
                isSequential: false,
            }),
            guards: {
                botTax: some({ lamports: sol(0.001), lastInstruction: true }),
                solPayment: some({ lamports: sol(0.001), destination: treasury.publicKey }),
                startDate: some({ date: Date.now() }),
                // All other guards are disabled...
            }
        })
        await createIx.sendAndConfirm(umi, options);
        console.log(`✅ - Created Candy Machine: ${candyMachine.publicKey.toString()}`)
    } catch (error) {
        console.log(error)
        console.log('❌ - Error creating Candy Machine.');
    }

    const configLines = [];

    // Add items to the Candy Machine
    try {
        
        for (const content of contents) {
        
            const file = content.file ?? null;
            const name = content.name ?? null;
    
            if( file == null ){
                content.status = "No File";
                configLines.push({ 
                    name: name
                });
                continue;
            }
            
            if( name == null ){
                content.status = "No Name";
                continue;
            }

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
            
            configLines.push({ 
                name: name,
                uri: irysImageUri
            });
            content.status = "OK";
        };

        console.log(configLines)

        await addConfigLines(umi, {
            candyMachine: candyMachine.publicKey,
            index: 0,
            configLines: configLines,
        }).sendAndConfirm(umi, options);
        console.log(`✅ - Added items to the Candy Machine: ${candyMachine.publicKey.toString()}`)
    } catch (error) {
        console.log(error)
        console.log('❌ - Error adding items to the Candy Machine.');
    }

    try{
        const metadata = {
            name: "My NFTs",
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
    }
    catch(error){

    }

    await checkCandyMachine(umi, candyMachine.publicKey, {
        itemsLoaded: configLines.length,
        authority: umi.identity.publicKey,
        collection: collectionAddress,
        itemsRedeemed: 0,
    }, 5);

    // Mint NFTs
    try {
        const numMints = configLines.length;
        let minted = 0;
        for (let i = 0; i < numMints; i++) {
            await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 }))
                .add(
                    mintV1(umi, {
                        candyMachine: candyMachine.publicKey,
                        asset: generateSigner(umi),
                        collection: collectionAddress,
                        mintArgs: {
                            solPayment: some({ destination: treasury.publicKey }),
                        },
                    })
                )
                .sendAndConfirm(umi, options);
            minted++;
        }
        console.log(`✅ - Minted ${minted} NFTs.`);
    } catch (error) {
        console.log(error)
        console.log('❌ - Error minting NFTs.');
    }
    
    try {
        await deleteCandyMachine(umi, {
            candyMachine: candyMachine.publicKey,
        }).sendAndConfirm(umi, options);
        console.log(`✅ - Deleted the Candy Machine: ${candyMachine.publicKey.toString()}`);
    } catch (error) {
        console.log(error)
        console.log('❌ - Error deleting the Candy Machine.');
    }
}





async function checkCandyMachine(
    umi,
    candyMachine,
    expectedCandyMachineState,
    step
) {
    try {
        const loadedCandyMachine = await fetchCandyMachine(umi, candyMachine, options.confirm);
        const { itemsLoaded, itemsRedeemed, authority, collection } = expectedCandyMachineState;
        if (Number(loadedCandyMachine.itemsRedeemed) !== itemsRedeemed) {
            throw new Error('Incorrect number of items available in the Candy Machine.');
        }
        if (loadedCandyMachine.itemsLoaded !== itemsLoaded) {
            throw new Error('Incorrect number of items loaded in the Candy Machine.');
        }
        if (loadedCandyMachine.authority.toString() !== authority.toString()) {
            throw new Error('Incorrect authority in the Candy Machine.');
        }
        if (loadedCandyMachine.collectionMint.toString() !== collection.toString()) {
            throw new Error('Incorrect collection in the Candy Machine.');
        }
        step && console.log(`${step}. ✅ - Candy Machine has the correct configuration.`);
    } catch (error) {
        if (error instanceof Error) {
            step && console.log(`${step}. ❌ - Candy Machine incorrect configuration: ${error.message}`);
        } else {
            step && console.log(`${step}. ❌ - Error fetching the Candy Machine.`);
        }
    }
}
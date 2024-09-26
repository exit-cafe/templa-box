import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
    generateSigner,
    keypairIdentity
} from "@metaplex-foundation/umi";
import { createMint } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import fs from "fs";
import { config } from "./config.js";
import chalk from "chalk";


export const createCollectionByName = async (name) => {

    console.log(chalk.blue(`\nCreating Collection: ${name}...\n`));

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

    console.log(chalk.green('Step 1: Initializing setup... [OK]'));

    //
    // ** Creating the Collection **
    //

    const collection = generateSigner(umi);
    
    const tx = await createCollection(umi, {
        collection,
        name: name,
        payer: umi.identity
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(chalk.green('Step 2: Collection create... [OK]'));

    console.log(chalk.green('\tView Transaction on Solana Explorer'));
    console.log(chalk.white(`\t\thttps://explorer.solana.com/tx/${signature}?cluster=devnet`));
    console.log(chalk.green('\tView NFT on Metaplex Explorer'));
    console.log(chalk.white(`\t\thttps://explorer.solana.com/address/${collection.publicKey}?cluster=devnet`));

    console.log(chalk.green('Step 3: Generate URL... [OK]'));

    console.log(chalk.bold.blue('\nProcess completed successfully! 🎉'));

    return {
        "publicKey": collection.publicKey,
        "signature": signature,
        "name": name
    };
}
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

    // await updateV1(umi, {
    //     mint: generateSigner(umi),
    //     metadata: findMetadataPda(umi, { mint : publicKey(contentMint) }),
    //     updateAuthority: umi.identity,
    //     uri: irysMetadataUri,
    //     authority: createSignerFromKeypair(umi, keypair)
    // }).sendAndConfirm(umi);

    // await verifyCollectionV1(umi, {
    //     metadata: metadataPda,
    //     collectionMint: collectionMint,
    //     authority: createSignerFromKeypair(umi, keypair)
    // }).sendAndConfirm(umi);

    const nft = await umi.nfts().findByMint({ contentMint }).run();

    const updatedMetadata = await umi.nfts().update({
        nftOrSft: nft,
        uri: irysMetadataUri, // 新しいメタデータURI
    }).run();

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





// `umi.nfts` が関数として利用できないというエラーは、UMIのバージョンやAPIの違いによるものかもしれません。UMI SDKの構造がバージョンによって異なることがあるため、適切なメソッドを利用する必要があります。

// まず、UMI SDKが正しくインストールされているか確認し、バージョンによっては異なるメソッドや構成が必要になることがあります。

// ### 代替案: `@metaplex-foundation/mpl-token-metadata` を使う方法

// `umi.nfts` を使う代わりに、`@metaplex-foundation/mpl-token-metadata` パッケージを使って、NFTのメタデータを直接操作することができます。こちらはSolana上でのNFTメタデータ操作によく使われるライブラリです。

// #### 1. 必要なパッケージのインストール
// 以下のコマンドで必要なパッケージをインストールします。

// ```bash
// npm install @metaplex-foundation/mpl-token-metadata @solana/web3.js @solana/spl-token
// ```

// #### 2. SolanaとMetaplexのセットアップ

// 以下のコードでSolanaとMetaplexのセットアップを行います。

// ```javascript
// const {
//   Metadata,
//   UpdateMetadataV2,
//   MetadataProgram,
// } = require('@metaplex-foundation/mpl-token-metadata');
// const { Connection, clusterApiUrl, Keypair, PublicKey } = require('@solana/web3.js');
// const { sendAndConfirmTransaction, Transaction } = require('@solana/web3.js');

// // Solanaのセットアップ
// const connection = new Connection(clusterApiUrl('mainnet-beta'));
// const keypair = Keypair.fromSecretKey(Uint8Array.from(YOUR_PRIVATE_KEY)); // あなたのウォレットの秘密鍵
// ```

// #### 3. Arweaveに新しいメタデータをアップロード

// ```javascript
// const Arweave = require('arweave');

// // Arweaveのセットアップ
// const arweave = Arweave.init({
//   host: 'arweave.net',
//   port: 443,
//   protocol: 'https',
// });

// async function uploadMetadataToArweave(newName, currentMetadata) {
//   const newMetadata = {
//     ...currentMetadata,
//     name: newName,
//   };

//   const transaction = await arweave.createTransaction({
//     data: JSON.stringify(newMetadata),
//   });

//   transaction.addTag('Content-Type', 'application/json');

//   // 署名して送信
//   await arweave.transactions.sign(transaction, YOUR_ARWEAVE_KEY);
//   const response = await arweave.transactions.post(transaction);

//   if (response.status === 200) {
//     console.log('Metadata uploaded:', transaction.id);
//     return `https://arweave.net/${transaction.id}`;
//   } else {
//     throw new Error('Failed to upload metadata');
//   }
// }
// ```

// #### 4. NFTのメタデータを更新

// アップロードした新しいURIを使って、NFTのメタデータを更新します。

// ```javascript
// async function updateNftMetadata(mintAddress, arweaveUri) {
//   const mintPublicKey = new PublicKey(mintAddress);
//   const metadataPDA = await Metadata.getPDA(mintPublicKey);

//   // 更新するメタデータの構築
//   const transaction = new Transaction().add(
//     new UpdateMetadataV2(
//       {
//         feePayer: keypair.publicKey,
//       },
//       {
//         metadata: metadataPDA,
//         updateAuthority: keypair.publicKey,
//         primarySaleHappened: null,
//         isMutable: true,
//         data: {
//           name: 'New NFT Name', // ここで新しい名前に変更
//           symbol: '',
//           uri: arweaveUri, // 新しいURIを設定
//           sellerFeeBasisPoints: 500, // 販売手数料
//           creators: null,
//         },
//       }
//     )
//   );

//   // トランザクションを送信
//   const signature = await sendAndConfirmTransaction(
//     connection,
//     transaction,
//     [keypair]
//   );
//   console.log('Transaction confirmed with signature:', signature);
// }

// const mintAddress = 'YOUR_NFT_MINT_ADDRESS'; // NFTのMintアドレス
// uploadMetadataToArweave('New NFT Name', currentMetadata).then((arweaveUri) => {
//   updateNftMetadata(mintAddress, arweaveUri);
// });
// ```

// ### まとめ
// 1. **`@metaplex-foundation/mpl-token-metadata`** を使ってNFTメタデータを更新します。
// 2. **Arweave** に新しいメタデータ（新しい名前を含む）をアップロードします。
// 3. アップロードしたURIを使って、Solana上のNFTメタデータを更新し、名前を変更します。

// `umi.nfts` が利用できない場合、このアプローチでNFTの名前を変更することが可能です。
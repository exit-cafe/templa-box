###### <p align="center">![image](https://github.com/user-attachments/assets/0668cf77-0391-48f6-a185-0fa8c5f683f3)</p>

## 概要
TemplaBoxは、開発者なしでクリエイターが1日でゲームをリリースすることができるゲームテンプレートサービスです。


TemplaBoxを使用すると、エンジニア以外の人でも驚くほど速くゲームを作成できます。開発時間が大幅に短縮され、わずか1日で独自のオリジナルゲームを作成できます。
![image](https://github.com/user-attachments/assets/8a711bae-98e8-4a0c-9291-0959d4155fac)


ゲーム制作は、Webサイト上から作成・編集などができ、直感的にゲーム制作を行うことができます。

また、さまざまなゲームテンプレートが用意されています。
![image](https://github.com/user-attachments/assets/28ea0959-1b04-41f7-b7a1-426ee3ada9c8)

## システム概要
4つのサーバーからサービスを構築します。
![image](https://github.com/user-attachments/assets/6d5dc3fc-57a5-462b-a0f8-ae9948e069a5)

| サーバー名 | 役割 |
| -- | -- |
| Office-Console | ゲーム制作者用 |
| Store-Office | ゲームシステム |
| Store-Front | ゲームプレイヤー用 |
| Factory | NFTの発行・取得 |

## システム詳細
### システム要件
- Nodejs v20.12.2
- npm 10.5.0

### セットアップと起動
1. GitHubからクローンを行います。
```bash
git clone https://github.com/exit-cafe/templa-box.git
cd templa-box
```

2. npmのセットアップを行います。
```bash
npm install
```

3. WebAPIサーバーの起動
```bash
node index.js
```


### WebAPI
#### CoreNFTの作成
##### POST : /nft
http://localhost:3000/nft
##### Request Body
| 値          | 概要  | 型 | デフォルト値  | 必須  | 例 |
| --          | -- | -- | -- | -- | -- |
| collection  | コレクションのPublicキー | String | Null | | `Go3mzTv7bP9X5cafRCxuoGTfmc4iXgNJfDgo48ZSAjDm` |
| name        | 名前| String | | ✅ | `Mountains Veiled in Mist and Light.` |
| file        | ファイルパス | String | | ✅ | `./image.png` |
| description | | String | Null | | `The image depicts a scenic landscape with layers of green rolling hills and a dense forest of evergreen trees. In the distance, there are larger, mist-covered mountains, creating a sense of depth and vastness. The lighting appears soft, suggesting that it may be early morning or late afternoon, with shadows falling across the hills. The contrast between the green foreground and the blueish mountains in the background adds to the tranquil, natural beauty of the scene.` |
| attributes  | 属性 | Array(String) | Null | | `["mountain", "green", "blue", "tree"]` |
| external_url| | String | Null | | `https://scannner.io` |
#### Response
| 値          | 概要  | 型 | 例 |
| --          | -- | -- | -- |
| status        | 成功したか | Boolean | `true` |

#### Example
```bash
curl --location 'http://localhost:3000/nft' \
--header 'Content-Type: application/json' \
--data '{
    "collection" : "Go3mzTv7bP9X5cafRCxuoGTfmc4iXgNJfDgo48ZSAjDm",
    "name" : "Mountains Veiled in Mist and Light.",
    "file" : "./image.png",
    "description" : "The image depicts a scenic landscape with layers of green rolling hills and a dense forest of evergreen trees. In the distance, there are larger, mist-covered mountains, creating a sense of depth and vastness. The lighting appears soft, suggesting that it may be early morning or late afternoon, with shadows falling across the hills. The contrast between the green foreground and the blueish mountains in the background adds to the tranquil, natural beauty of the scene.",
    "attributes" : ["mountain", "green", "blue", "tree"],
    "external_url" : "[./image.png](https://scannner.io)"
}'
```

#### Collectionの作成
##### POST : /collection
http://localhost:3000/collection
##### Request Body
| 値          | 概要  | 型 | デフォルト値  | 必須  | 例 |
| --          | -- | -- | -- | -- | -- |
| name        | 名前| String | | ✅ | `Card List` |
#### Response
| 値          | 概要  | 型 | 例 |
| --          | -- | -- | -- |
| status        | 成功したか | Boolean | `true` |
| collection.publicKey        | 成功したか | Boolean | `GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq` |
| collection.signature        | 成功したか | Boolean | `5NNGh875f5Bz4uf7WvLyP1Kf2u3gvMVddGYdvdWLnpnpWjaikZey2omuwzgzWHNWCjBfZHXiuEMtLCDUUzn22xKb` |
| collection.name        | 名前| String | `Card List` |
#### Example
```bash
curl --location 'http://localhost:3000/collection' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Card List"
}'
```

#### 既存NFTのCollectionへの追加
##### PUT : /nft/verify
http://localhost:3000/nft/verify
##### Request Body
| 値          | 概要  | 型 | デフォルト値  | 必須  | 例 |
| --          | -- | -- | -- | -- | -- |
| collectionMint | コレクションのPublicキー | String | | ✅ | `GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq` |
| contentMint | コンテンツのPublicキー | String | | ✅ | `FBWndhC4Ch5VG6vooEKp3UvUtjXQFtv4UNdkjmdRQh7N` |
#### Response
| 値          | 概要  | 型 | 例 |
| --          | -- | -- | -- |
| status        | 成功したか | Boolean | `true` |
#### Example
```bash
curl --location --request PUT 'http://localhost:3000/nft/verify' \
--header 'Content-Type: application/json' \
--data '{
    "collectionMint": "GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq",
    "contentMint": "FBWndhC4Ch5VG6vooEKp3UvUtjXQFtv4UNdkjmdRQh7N"
}'
```

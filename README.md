###### <p align="center">![image](https://github.com/user-attachments/assets/0668cf77-0391-48f6-a185-0fa8c5f683f3)</p>

## Overview
TemplaBox is a game template service that allows creators to release games within a day without the need for developers.

With TemplaBox, even non-engineers can create games incredibly quickly. The development time is drastically reduced, allowing you to create your own original game in just one day.
![image](https://github.com/user-attachments/assets/8a711bae-98e8-4a0c-9291-0959d4155fac)

Game creation can be done and edited directly through the website, allowing for intuitive game production.

Additionally, various game templates are provided.
![image](https://github.com/user-attachments/assets/28ea0959-1b04-41f7-b7a1-426ee3ada9c8)

## System Overview
The service is built with four servers.
![image](https://github.com/user-attachments/assets/6d5dc3fc-57a5-462b-a0f8-ae9948e069a5)

| Server Name    | Role                |
| -------------- | ------------------- |
| Office-Console | For game creators    |
| Store-Office   | Game system          |
| Store-Front    | For game players     |
| Factory        | NFT issuance/retrieval |

## System Details
### System Requirements
- Nodejs v20.12.2
- npm 10.5.0

### Setup and Startup
1. Clone from GitHub:
```
git clone https://github.com/exit-cafe/templa-box.git
cd templa-box
```

2. Set up npm:
```
npm install
```

3. Start the WebAPI server:
```
node index.js
```

### WebAPI
#### Create CoreNFT
##### POST : /nft
http://localhost:3000/nft
##### Request Body
| Parameter     | Description                      | Type   | Default Value | Required | Example                                                 |
| ------------- | -------------------------------- | ------ | ------------- | -------- | ------------------------------------------------------- |
| collection    | Public key of the collection     | String | Null          |          | `Go3mzTv7bP9X5cafRCxuoGTfmc4iXgNJfDgo48ZSAjDm`         |
| name          | Name                            | String |               | ✅        | `Mountains Veiled in Mist and Light.`                   |
| file          | File path                       | String |               | ✅        | `./image.png`                                           |
| description   | Description                     | String | Null          |          | `The image depicts a scenic landscape...`               |
| attributes    | Attributes                      | Array  | Null          |          | `["mountain", "green", "blue", "tree"]`                 |
| external_url  | External URL                    | String | Null          |          | `https://scannner.io`                                   |
##### Response
| Parameter     | Description              | Type    | Example      |
| ------------- | ------------------------ | ------- | ------------ |
| status        | Whether the operation succeeded | Boolean | `true`       |

#### Example
```
curl --location 'http://localhost:3000/nft' \
--header 'Content-Type: application/json' \
--data '{
    "collection" : "Go3mzTv7bP9X5cafRCxuoGTfmc4iXgNJfDgo48ZSAjDm",
    "name" : "Mountains Veiled in Mist and Light.",
    "file" : "./image.png",
    "description" : "The image depicts a scenic landscape...",
    "attributes" : ["mountain", "green", "blue", "tree"],
    "external_url" : "https://scannner.io"
}'
```

#### Create Collection
##### POST : /collection
http://localhost:3000/collection
##### Request Body
| Parameter     | Description     | Type   | Default Value | Required | Example    |
| ------------- | --------------- | ------ | ------------- | -------- | ---------- |
| name          | Name            | String |               | ✅        | `Card List`|
##### Response
| Parameter              | Description        | Type    | Example   |
| ---------------------- | ------------------ | ------- | --------- |
| status                 | Whether it succeeded | Boolean | `true`    |
| collection.publicKey   | Collection public key | String | `GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq` |
| collection.signature   | Collection signature | String | `5NNGh875f5Bz4uf7WvLyP1Kf2u3gvMVddGYdvdWLnpnpWjaikZey2omuwzgzWHNWCjBfZHXiuEMtLCDUUzn22xKb` |
| collection.name        | Name               | String  | `Card List`|

#### Example
```
curl --location 'http://localhost:3000/collection' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Card List"
}'
```

#### Add Existing NFT to Collection
##### PUT : /nft/verify
http://localhost:3000/nft/verify
##### Request Body
| Parameter     | Description                     | Type   | Default Value | Required | Example                                                 |
| ------------- | -------------------------------- | ------ | ------------- | -------- | ------------------------------------------------------- |
| collectionMint | Public key of the collection    | String |               | ✅        | `GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq`         |
| contentMint   | Public key of the content       | String |               | ✅        | `FBWndhC4Ch5VG6vooEKp3UvUtjXQFtv4UNdkjmdRQh7N`         |
##### Response
| Parameter     | Description              | Type    | Example      |
| ------------- | ------------------------ | ------- | ------------ |
| status        | Whether the operation succeeded | Boolean | `true`       |

#### Example
```
curl --location --request PUT 'http://localhost:3000/nft/verify' \
--header 'Content-Type: application/json' \
--data '{
    "collectionMint": "GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq",
    "contentMint": "FBWndhC4Ch5VG6vooEKp3UvUtjXQFtv4UNdkjmdRQh7N"
}'
```

<p align="center">
  <img src="https://github.com/user-attachments/assets/fbb40442-0b2d-4c19-99b7-61213f05a731" alt="TemplaBox Logo">
</p>

# 🌟 **Overview**

**TemplaBox** is a game template service that allows creators to release games within a day without the need for developers.

With **TemplaBox**, even non-engineers can create games **incredibly quickly**. The development time is drastically reduced, allowing you to create your own **original game in just one day**.

<p align="center">
  <img src="https://github.com/user-attachments/assets/245d8e03-3d6d-4b00-bcb8-fa51b23e8cb9" alt="TemplaBox Example Game">
</p>

Game creation can be done and edited directly through the website, allowing for **intuitive game production**. Additionally, **various game templates** are provided.

<p align="center">
  <img src="https://github.com/user-attachments/assets/3b53c426-dca2-424c-bf4f-926cf80920c4" alt="Game Template Example">
</p>

---

## ⚙️ **System Overview**

The service is built with **four servers**, ensuring **high performance and scalability**.

<p align="center">
  <img src="https://github.com/user-attachments/assets/d66c48ff-d946-4032-b98d-26e92ffa7a26" alt="System Architecture">
</p>

| **Server Name**   | **Role**               |
| ----------------- | ---------------------- |
| **Office-Console** | For game creators      |
| **Store-Office**   | Game system            |
| **Store-Front**    | For game players       |
| **Factory**        | NFT issuance/retrieval |

---

## 🛠️ **System Details**
<p align="center">
  <img src="https://github.com/user-attachments/assets/47b65447-9e2e-46d2-9406-a843da57f939" alt="System Architecture">
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/5c6b4908-0a09-44e6-b72d-421b25fd457b" alt="System Architecture">
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/8a9baf45-17da-41db-bd8f-5609bd29341c" alt="System Architecture">
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/60a1fbcc-64bd-4b21-bc6e-259530674b41" alt="System Architecture">
</p>

### **System Requirements**
- **Node.js v20.12.2**
- **npm 10.5.0**

### **Setup and Startup**
1. **Clone from GitHub**:
   ```bash
   git clone https://github.com/exit-cafe/templa-box.git
   cd templa-box
   ```
2. **Set up npm**:
```bash
npm install
```

3. **Start the WebAPI server**:
```bash
node index.js
```

### 🌐 **WebAPI**

#### 🖼️ **Create CoreNFT**
- **POST** : `/nft`
- **URL**: `http://localhost:3000/nft`

---

##### 📥 **Request Body**
| **Parameter**   | **Description**                  | **Type** | **Default Value** | **Required** | **Example**                                                |
| --------------- | -------------------------------- | -------- | ----------------- | ------------ | ---------------------------------------------------------- |
| **collection**  | Public key of the collection     | String   | Null              |              | `Go3mzTv7bP9X5cafRCxuoGTfmc4iXgNJfDgo48ZSAjDm`             |
| **name**        | Name                            | String   |                   | ✅            | `Mountains Veiled in Mist and Light.`                       |
| **file**        | File path                       | String   |                   | ✅            | `./image.png`                                               |
| **description** | Description                     | String   | Null              |              | `The image depicts a scenic landscape...`                   |
| **attributes**  | Attributes                      | Array    | Null              |              | `["mountain", "green", "blue", "tree"]`                     |
| **external_url**| External URL                    | String   | Null              |              | `https://scannner.io`                                       |

---

##### 📤 **Response**
| **Parameter**   | **Description**                 | **Type**  | **Example**   |
| --------------- | ------------------------------- | -------- | ------------- |
| **status**      | Whether the operation succeeded | Boolean  | `true`        |

---

#### 🧑‍💻 **Example**
```bash
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

#### 🗂️ **Create Collection**
- **POST** : `/collection`
- **URL**: `http://localhost:3000/collection`

---

##### 📥 **Request Body**
| **Parameter**   | **Description**    | **Type** | **Default Value** | **Required** | **Example**    |
| --------------- | ------------------ | -------- | ----------------- | ------------ | -------------- |
| **name**        | Name               | String   |                   | ✅            | `Card List`    |

---

##### 📤 **Response**
| **Parameter**               | **Description**         | **Type**  | **Example**   |
| --------------------------- | ----------------------- | -------- | ------------- |
| **status**                  | Whether it succeeded    | Boolean  | `true`        |
| **collection.publicKey**     | Collection public key   | String   | `GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq` |
| **collection.signature**     | Collection signature    | String   | `5NNGh875f5Bz4uf7WvLyP1Kf2u3gvMVddGYdvdWLnpnpWjaikZey2omuwzgzWHNWCjBfZHXiuEMtLCDUUzn22xKb` |
| **collection.name**          | Name                   | String   | `Card List`   |

---

#### 🧑‍💻 **Example**
```bash
curl --location 'http://localhost:3000/collection' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Card List"
}'

```

#### 🔄 **Add Existing NFT to Collection**
- **PUT** : `/nft/verify`
- **URL**: `http://localhost:3000/nft/verify`

---

##### 📥 **Request Body**
| **Parameter**     | **Description**                  | **Type** | **Default Value** | **Required** | **Example**                                                |
| ----------------- | -------------------------------- | -------- | ----------------- | ------------ | ---------------------------------------------------------- |
| **collectionMint** | Public key of the collection     | String   |                   | ✅            | `GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq`             |
| **contentMint**    | Public key of the content        | String   |                   | ✅            | `FBWndhC4Ch5VG6vooEKp3UvUtjXQFtv4UNdkjmdRQh7N`             |

---

##### 📤 **Response**
| **Parameter**   | **Description**                  | **Type**  | **Example**   |
| --------------- | -------------------------------- | -------- | ------------- |
| **status**      | Whether the operation succeeded  | Boolean  | `true`        |

---

#### 🧑‍💻 **Example**
```bash
curl --location --request PUT 'http://localhost:3000/nft/verify' \
--header 'Content-Type: application/json' \
--data '{
    "collectionMint": "GQWfkmyaEoskw8eXhzhzWYwUi5ET3yMgfFSAqsyThvTq",
    "contentMint": "FBWndhC4Ch5VG6vooEKp3UvUtjXQFtv4UNdkjmdRQh7N"
}'
```

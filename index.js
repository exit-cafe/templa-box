import { createCollectionByName } from "./src/collectionMint.js";
import { createCoreNFTMint } from "./src/coreNFTMint.js";
import express from "express";
var app = express();

/* 2. listen()メソッドを実行して3000番ポートで待ち受け。*/
var server = app.listen(3000, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(express.json());
app.post("/collection", async function(req, res, next){

    if( req.body.name != undefined ){
        const collection = await createCollectionByName(req.body.name);

        res.json({
            "status": true,
            "collection" : collection
        })
        return;
    }

    res.json({
        "status": false,
        a: req.body
    });
});

app.post("/nft", async function(req, res, next){

    if( req.body != undefined ){
        const result = await createCoreNFTMint(req.body);

        res.json({
            "status": true,
            "result" : result
        })
        return;
    }

    res.json({
        "status": false,
        a: req.body
    });
});
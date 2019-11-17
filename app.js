const express = require('express');
const app = express();

var fligrid = require("./flipgrid");


app.get('/', async function (req, res) {
    res.send("Hello World");
    //res.redirect("https://google.com");

})

app.get('/getAll', async function (req, res) {

    let responseBody;
    let status = 200; // for default

    if (req.headers.authorization != undefined && req.headers.authorization.startsWith("Bearer")) {
        let bearerToken = req.headers.authorization;
        responseBody = bearerToken;
        responseBody = await fligrid.main("bearer", bearerToken);

    } else if (req.headers["email"] != undefined && req.headers["password"] != undefined) {
        let email = req.headers["email"];
        let password = req.headers["password"];
        responseBody = await fligrid.main("password", {
            "email": email,
            "password": password
        });

    } else {
        responseBody = "No authentication info has been provided";
        status = 400;
    }

    res.status(status);
    res.send(responseBody);
})


app.listen(process.env.PORT || 3000, () => console.log("Listening to port 3000"));
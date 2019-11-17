import {
    rejects
} from 'assert';

var FormData = require('form-data');
const fetch = require("node-fetch");

const baseURL = "https://ruby.flipgrid.com/api";
const tokenURL = baseURL + "/oauth/token";
const gridsURL = baseURL + "/manage/grids?order_by=updated_at&per_page=50&page=1";
const gridBase = baseURL + "/manage/grids/";
const topicsSuffix = "/topics?order_by=position&per_page=50&page=1";
const csvSuffix = "/responses.csv?order_by=position&per_page=50&roots_only=false&page=1&topic_id=";

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index += 1) {
        await callback(array[index], index, array);
    }
}

let getIds = (obj) => {
    var data = obj["data"];
    data = data.map(x => x["id"]);
    return data;
}

let generateMainCSV = async (method, credentials) => {

    var mainCSV = [];
    let token;

    if (method == "password") {
        let form = new FormData();
        form.append("username", credentials["email"]);
        form.append("password", credentials["password"]);
        form.append("client_id", "ced1b73ce4faa8fc801299aed88ce127d12686481004a6d60696c2ec6f5a5308"); //Default
        form.append("client_secret", "ae2913a2c170de991809f91008d04b12a051400ad2db207371fe88cdafcc2f03"); //Default
        form.append("grant_type", "password");

        // Getting Token
        token = await fetch(tokenURL, {
                method: "POST",
                body: form
            })
            .then(results => results.json())
            .then(res => {
                var token = res["access_token"];
                return "Bearer " + token;
            })
            .catch(e => {
                console.log(e)
            });

    } else if (method == "bearer") {
        token = credentials;
    } else{
        return "";
    }

    // Defining parameters for get requests
    let requestParameters = {
        headers: {
            authorization: token,
            "accept": "application/json",
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) " +
                "AppleWebKit/537.36 (KHTML, like Gecko) " +
                "Chrome/78.0.3904.97 Safari/537.36"
        }
    };

    // Getting Grids
    let grids = await fetch(gridsURL, requestParameters)
        .then(response => {
            if (response.ok) return response
            else throw "Problem with authentication..."
        })
        .then(res => res.json())
        .then(resp => getIds(resp))
        //.then(resp => resp.slice(0, 2)) // For test purpose
        .catch(e => {
            console.log(e)
        });

    let mainCsvReady = new Promise(async (resolve, reject) => {

            let getTopics = await asyncForEach(grids, async (grid) => {

                let topicURL = gridBase + grid + topicsSuffix;

                // Getting Topics
                let getTopic = await fetch(topicURL, requestParameters)
                    .then(out => out.json())
                    .then(out => getIds(out))
                    //.then(out => out.slice(0, 2)) // For test purpose
                    .then(topics => {
                        asyncForEach(topics, async (topic) => {

                            let csvURL = gridBase + grid + csvSuffix + topic

                            // Getting CSV
                            let csv = await fetch(csvURL, requestParameters)
                                .then(response => {
                                    if (response.ok) return response.text()
                                    else throw "CSV response failed";
                                }).then(output => {
                                    var cleanData = output.split("\n");
                                    cleanData.shift();
                                    // Clean empty rows
                                    cleanData.filter(item => {
                                        return item != ""
                                    })
                                    // Add csv from topic to main CSV array
                                    mainCSV = mainCSV.concat(cleanData);
                                    if (grid == grids[grids.length - 1] && topic == topics[topics.length - 1]) {
                                        resolve("que okay")
                                    };
                                })
                                .catch(e => console.log(e));
                        })
                    })
            })
        })
        .then(dummy => {
            // Filter empty rows
            mainCSV.filter(item => {
                return item != ""
            })
            return mainCSV;
        })

    var val = await mainCsvReady;
    return val;
}

async function main(method, credentials) {

    let value;

    if (method == "bearer" || method == "password") {
        value = await generateMainCSV(method, credentials);
    } else {
        value = "";
    }

    return value;
}



export {
    main
}


// Credits
// Inspiration from: https://bitbucket.org/ygaarge/ylo-edmodo-reports-plugin/
// asyncForEach:     https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
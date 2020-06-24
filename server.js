const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
var app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static('public'));
app.get('/setup', (req, res) => {
    var options = { root: path.join(__dirname, 'public') };
    res.sendFile('setup.html', options);
})
app.get('/home', (req, res) => {
    var options = { root: path.join(__dirname, 'public') };
    res.sendFile('index.html', options);
})


app.post('/setkey', (req, res) => {
    res.redirect('/home');
    init(req.body.keystring);
    

});
function init(keystring) {
    keyarray = keystring.split(",");
    keydata = {};
    Object.assign(keydata, keyarray);
    var data = {};
    var d = {};
    for (var i = 0; i < keyarray.length; i++) {
        d[keyarray[i]] = 0;
    }
    Object.assign(data, { "data": [d] });
    fs.writeFile("data.json", JSON.stringify(data), err => {

        // Checking for errors 
        if (err) throw err;

        console.log("Done writing"); // Success 
    });
}
app.get('/api/data', (req, res) => {
    fs.readFile("data.json", function (err, d) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        const data = JSON.parse(d);

        res.send(data);
    });

});


//-------------------------------------------http GET-------------------------------------------------------------

app.get('/api/data/:id', (req, res) => {
    fs.readFile("data.json", function (err, d) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        const data = JSON.parse(d);
        const user = data.data.find(u => u.id === parseInt(req.params.id));
        if (!user) {
            return res.status(404).send('the user was not found');
        }
        res.status(200).send(user);
    });
});

// //-----------------------------------------http POST---------------------------------------------------------------

app.post('/api/data', (req, res) => {
    if (isEmpty(req.body)) {
        return res.status(400).send('Values cannot be null');
    }

    fs.readFile("data.json", function (err, d) {

        // Check for errors 
        if (err) throw err;
        // Converting to JSON 
        const data = JSON.parse(d);
        var user = {};
        Object.assign(user, data.data[0]);
        var keys = Object.keys(user);
        var m = req.body;

        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            user[k] = m[Object.keys(m).find(x => x == k)];
        }
        user.id = data.data[data.data.length - 1].id + 1;

        data.data.push(user);

        fs.writeFile("data.json", JSON.stringify(data), err => {

            // Checking for errors 
            if (err) throw err;

            console.log("Done writing"); // Success 
        });
        res.status(200).send(user);
    });

});


// //------------------------------------------http PUT-----------------------------------------------------------------

app.put('/api/data/:id', (req, res) => {
    if (req.params.id == 0) {
        return res.status(400).send('Access restrictes to id = 0');
    }
    if (isEmpty(req.body)) {
        return res.status(400).send('Values cannot be null');
    }

    fs.readFile("data.json", function (err, d) {

        // Check for errors 
        if (err) throw err;

        //Converting to JSON 
        const data = JSON.parse(d);
        if (!data.data.find(x => x.id == parseInt(req.params.id))) {
            return res.status(404).send('the user was not found');
        }
        if (isEmpty(req.body)) {
            return res.status(400).send('values cannot be null');
        }

        var user = {};
        Object.assign(user, data.data[0]);
        var keys = Object.keys(user);
        var m = req.body;
        console.log(isEmpty(req.body));
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            user[k] = m[Object.keys(m).find(x => x == k)];
        }
        user.id = parseInt(req.params.id);
        Object.assign(data.data.find(x => x.id == parseInt(req.params.id)), user);

        fs.writeFile("data.json", JSON.stringify(data), err => {

            // Checking for errors 
            if (err) throw err;

            console.log("Done writing"); // Success 
        });
        res.status(200).send(data.data.find(u => u.id === parseInt(req.params.id)));
    });
});


//----------------------------------------http DELETE-----------------------------------------------------------------
app.delete('/api/data/:id', (req, res) => {
    if (req.params.id == 0) {
        return res.status(400).send('Access restrictes to id = 0');
    }
    fs.readFile("data.json", function (err, d) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        const data = JSON.parse(d);
        if (!data.data.find(u => u.id === parseInt(req.params.id))) {
            return res.status(404).send('the user was not found');
        }
        const user = data.data.find(u => u.id === parseInt(req.params.id));
        const index = data.data.indexOf(data.data.find(u => u.id === parseInt(req.params.id)));
        data.data.splice(index, 1);
        fs.writeFile("data.json", JSON.stringify(data), err => {

            // Checking for errors 
            if (err) throw err;

            console.log("Done writing"); // Success 
        });
        res.status(200).send(user);
    });
});
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log('SERVER  is running on PORT 3000 ...') });


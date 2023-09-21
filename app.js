// HTTP Methods

const http = require("http");
const url = require('node:url');
const PORT = 3000;

const server = http.createServer((req, res) => {
//GET
if(req.method === 'GET' && req.url === '/api'){
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end();

//POST
}else if(req.method === 'POST' && req.url === '/api/create'){


//PUT
}else if(req.method === 'PUT' && req.url === '/api/update'){


//DELETE
}else if(req.method === "DELETE"){

}else{
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
}
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
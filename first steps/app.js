const http = require('http')
const os = require('os')

console.log('Kubia server starting...')

const handler = (req, res) => {
  console.log(`Received request from from ${req.connection.remoteAddress}`)
  res.writeHead(200)
  res.end(`You've hit ${os.hostname()} \n`)
}

const www = http.createServer(handler)
www.listen(8080)

const express = require('express')
const jwt = require('jsonwebtoken')

const key = require('./key')
const { log } = require('console')

const app = express()

// Set port
const PORT = process.env.PORT ?? 1234

// Disable x-powered-by
app.disable('x-powered-by')
// Set key
app.set('key', key.key)
// Set middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Set routes
app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Config JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body
    if (username !== 'admin' || password !== 'admin') {
        return res.status(401).json({ message: 'Invalid credentials' })
    }
    const payload = { check: true }
    const token = jwt.sign(payload, app.get('key'), { expiresIn: '1h' })
    res.json({ token })
})

//const verify = express.Router()

app._router.use((req, res, next) => {
    // Get token
    const headerToken = req.headers['x-access-token'] || req.headers['authorization']
    // Verify token
    if (!headerToken) return res.status(401).json({ message: 'No token provided' })
    // Verify Type toke is Bearer
    if (headerToken.split(' ')[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid token' })
    }
    // Get token
    const token = headerToken.split(' ')[1]
    log(token)
    // Verify token
    jwt.verify(token, app.get('key'), (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Failed to authenticate token', error: err.message })
        req.decoded = decoded
        next()
    })
})

app.get('/info', (req, res) => {
    res.json({ success: true })
})

// Init server
app.listen(PORT, () => console.log(`server running on port http://localhost:${PORT}`))
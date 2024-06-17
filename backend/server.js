const compression = require('compression')
const express = require('express')

const app = express()
const PORT = process.env.PORT || 5000

// Enable gzip compression
app.use(compression())

// Serve static files from the frontend's dist directory
app.use(
    express.static('../dist/frontend', {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.gz')) {
                res.setHeader('Content-Encoding', 'gzip')
                res.setHeader('Content-Type', 'application/javascript')
            } else if (filePath.endsWith('.wasm')) {
                res.setHeader('Content-Type', 'application/wasm')
            }
        }
    })
)

// Fallback to index.html for SPA
app.get('*', (_, res) => {
    res.sendFile('/dist/frontend/index.html')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

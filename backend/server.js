import compression from 'compression'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath( import.meta.url )
const __dirname = path.dirname( __filename )

// Absolute path to your built frontend
const root = path.resolve( __dirname, '../dist/frontend' )

const app = express()
const PORT = process.env.PORT || 5000

// Enable gzip compression
app.use( compression() )

// Serve static files from the frontend's dist directory
app.use( express.static( root, {
    setHeaders: ( res, filePath ) => {
        if ( filePath.endsWith( '.gz' ) ) {
            res.setHeader( 'Content-Encoding', 'gzip' )
            res.setHeader( 'Content-Type', 'application/javascript' )
        } else if ( filePath.endsWith( '.wasm' ) ) {
            res.setHeader( 'Content-Type', 'application/wasm' )
        }
    }
} ) )

// Fallback to index.html for SPA
app.get( /.*/, ( _req, res ) => {
    res.sendFile( path.join( root, 'index.html' ) )
} )

app.listen( PORT, () => {
    console.log( `Server is running on port ${PORT}` )
} )
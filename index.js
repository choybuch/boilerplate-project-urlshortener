require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let urlDatabase = [];
let urlId = 1;

// Helper function to validate URLs
function isValidHttpUrl(string) {
  try {
    let url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  if (!isValidHttpUrl(original_url)) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL already exists
  let found = urlDatabase.find(entry => entry.original_url === original_url);
  if (found) {
    return res.json({ original_url: found.original_url, short_url: found.short_url });
  }

  // Store new URL
  let short_url = urlId++;
  urlDatabase.push({ original_url, short_url });
  res.json({ original_url, short_url });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = parseInt(req.params.short_url);
  const entry = urlDatabase.find(e => e.short_url === short_url);
  if (entry) {
    return res.redirect(entry.original_url);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

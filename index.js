require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urls = [];
let nextId = 1;

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  let parsedUrl;

  try {
    parsedUrl = new URL(originalUrl);

    if (
      parsedUrl.protocol !== 'http:' &&
      parsedUrl.protocol !== 'https:'
    ) {
      return res.json({ error: 'invalid url' });
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, function(err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const existingUrl = urls.find(function(item) {
      return item.original_url === originalUrl;
    });

    if (existingUrl) {
      return res.json(existingUrl);
    }

    const newUrl = {
      original_url: originalUrl,
      short_url: nextId++
    };

    urls.push(newUrl);
    res.json(newUrl);
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = Number(req.params.short_url);

  const savedUrl = urls.find(function(item) {
    return item.short_url === shortUrl;
  });

  if (!savedUrl) {
    return res.json({ error: 'No short URL found' });
  }

  res.redirect(savedUrl.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return resolve(null);
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body || body.trim() === '') {
        return resolve(null);
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(null); // or reject(new Error('Invalid JSON'))
      }
    });
    req.on('error', reject);
  });
}

module.exports = { parseJsonBody };

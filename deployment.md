# Deployment and Proxy Configuration Guide

This project uses a **Node.js Proxy Server** to communicate with the Qoyod API. This is necessary to bypass **CORS (Cross-Origin Resource Sharing)** restrictions that would otherwise prevent your browser from talking directly to `api.qoyod.com`.

## Why requests hit your subdomain
When you see requests in your browser pointing to `https://test.yourdomain.com/api/...`, this is **correct behavior**. 

1. Your browser sends the request to **your server** (the Proxy).
2. **Your server** (using `server.js`) receives the request.
3. **Your server** adds the `API-KEY` and forwards the request to `https://api.qoyod.com`.
4. **Your server** gets the response and sends it back to your browser.

## Remote Hosting Requirements

To host this project remotely (e.g., on a subdomain), you must ensure:

### 1. The Node.js server is running
You cannot just upload the HTML files. You must run the `server.js` file using Node.js.
Recommended tool: **PM2**
```bash
pm2 start server.js --name "qoyod-tester"
```

### 2. Nginx Reverse Proxy
Your Nginx configuration must point the web traffic to the Node.js process (usually on port 3000).

```nginx
server {
    listen 80;
    server_name test.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000; # Forward all traffic to the Node.js server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting
If you see errors when clicking "Refresh Data":

- **404 Not Found**: This usually means the path `/api` is not being handled by the server. Ensure `server.js` is running and Nginx is correctly proxying.
- **500 Proxy Error**: This means `server.js` is running but cannot reach the Qoyod API (check your server's internet connection).
- **CORS Error**: This means you are likely trying to access the API directly from the browser instead of using the `/api` path.

## Custom API URL
If you want to host the proxy server on a different domain than the HTML files, you can add this script tag to your `workflows.html` **before** the other scripts:

```html
<script>
  window.QOYOD_API_CONFIG = {
    baseUrl: 'https://your-proxy-api.com/api'
  };
</script>
```

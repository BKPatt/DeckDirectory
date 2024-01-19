import { createProxyMiddleware } from 'http-proxy-middleware';

export default function (app) {
    app.use(
        '/services',
        createProxyMiddleware({
            target: 'https://svcs.sandbox.ebay.com',
            changeOrigin: true,
        })
    );
};

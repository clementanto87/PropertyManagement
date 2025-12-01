import https from 'https';
import dns from 'dns';

// Force IPv4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const url = 'https://www.googleapis.com/oauth2/v1/certs';

console.log(`Testing connectivity to ${url} (IPv4 preferred)...`);

const req = https.get(url, { family: 4 }, (res) => {
    console.log('statusCode:', res.statusCode);

    res.on('data', (d) => {
        console.log('Data received (first 100 chars):', d.toString().substring(0, 100));
        req.destroy();
    });
});

req.on('error', (e) => {
    console.error('Connectivity check failed:', e);
});

req.end();

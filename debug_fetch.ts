import dns from 'dns';

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const url = 'https://www.googleapis.com/oauth2/v1/certs';

console.log(`Testing fetch to ${url}...`);

async function testFetch() {
    try {
        const start = Date.now();
        const response = await fetch(url, { method: 'HEAD' });
        console.log('Status:', response.status);
        console.log('Duration:', Date.now() - start, 'ms');
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testFetch();

const https = require('https');
const fs = require('fs');
const url = require('url');

function downloadVideo(fileUrl, dest) {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
            'Referer': 'https://coverr.co/'
        }
    };

    https.get(fileUrl, options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
            console.log('Redirecting to:', res.headers.location);
            // Handle relative redirects
            const redirectUrl = new url.URL(res.headers.location, fileUrl).href;
            downloadVideo(redirectUrl, dest);
        } else if (res.statusCode === 200) {
            console.log('Starting download...');
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('Download complete.');
            });
        } else {
            console.error(`Failed to download. Status code: ${res.statusCode}`);
            res.resume(); // Consume response data to free up memory
        }
    }).on('error', (err) => {
        console.error('Error:', err.message);
    });
}

downloadVideo('https://cdn.coverr.co/videos/coverr-driving-in-the-rain-2089/1080p.mp4', 'public/images/driving.mp4');

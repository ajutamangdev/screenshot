#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const playwright = require('playwright');

function normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `http://${url}`;
    }
    return url;
}

async function takeScreenshot(url, outputDir) {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        const normalizedUrl = normalizeUrl(url);
        console.log(`Navigating to ${normalizedUrl}`);
        await page.goto(normalizedUrl, { timeout: 10000, waitUntil: 'domcontentloaded' });
        const fileName = `${url.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        const filePath = path.join(outputDir, fileName);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Screenshot saved: ${filePath}`);
    } catch (error) {
        console.error(`Failed to take screenshot of ${url}:`, error.message);
    } finally {
        await browser.close();
    }
}

async function main() {
    const inputFile = process.argv[2];
    const outputDir = process.argv[3] || 'screenshots';

    if (!inputFile) {
        console.error('Usage: node script.js <subdomain.txt> [output-directory]');
        process.exit(1);
    }

    if (!fs.existsSync(inputFile)) {
        console.error(`File not found: ${inputFile}`);
        process.exit(1);
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const urls = fs.readFileSync(inputFile, 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
    for (const url of urls) {
        await takeScreenshot(url, outputDir);
    }

    console.log('Screenshots completed.');
}

main();

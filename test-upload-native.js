#!/usr/bin/env node

/**
 * Native JavaScript test script for Baklib file upload
 * Tests upload without Bearer prefix in Authorization header
 * Based on: https://dev.baklib.cn/api#/paths/dam-files/post
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Get token from command line argument, environment variable, or .env file
const BAKLIB_TOKEN = process.argv[3] || process.env.BAKLIB_TOKEN || '';
const BAKLIB_API_BASE = 'https://open.baklib.com';
const API_URL = `${BAKLIB_API_BASE}/api/v1/dam/files`;

async function testUpload(filePath) {
  try {
    console.log('🧪 Testing Baklib file upload (without Bearer prefix)...\n');
    
    // Check token
    if (!BAKLIB_TOKEN) {
      console.error('❌ Error: BAKLIB_TOKEN not set in .env file');
      console.log('\n💡 Please create a .env file with:');
      console.log('   BAKLIB_TOKEN=your-api-token-here\n');
      process.exit(1);
    }

    // Resolve file path
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);

    console.log(`📁 File path: ${absolutePath}`);

    // Check if file exists
    try {
      await fs.access(absolutePath);
    } catch (error) {
      console.error(`❌ Error: File not found: ${absolutePath}`);
      process.exit(1);
    }

    // Get file stats
    const stats = await fs.stat(absolutePath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);

    // Read file
    const fileBuffer = await fs.readFile(absolutePath);
    const fileName = path.basename(absolutePath);
    
    console.log(`📝 File name: ${fileName}\n`);

    // Get MIME type
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.md': 'text/markdown',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    console.log(`🔖 MIME type: ${mimeType}`);

    // Create form data
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });
    formData.append('type', 'file');

    console.log(`\n🚀 Uploading to: ${API_URL}`);
    console.log(`🔑 Using token: ${BAKLIB_TOKEN.substring(0, 10)}...`);
    console.log(`📋 Authorization header format: ${BAKLIB_TOKEN.substring(0, 10)}... (no Bearer prefix)\n`);

    // Upload - According to API docs, no Bearer prefix needed
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': BAKLIB_TOKEN,  // No Bearer prefix
        ...formData.getHeaders(),
      },
      body: formData,
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ Upload failed!`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText.substring(0, 500)}\n`);
      process.exit(1);
    }

    const result = await response.json();
    
    console.log(`\n✅ Upload successful!\n`);
    console.log('📦 Response:');
    console.log(JSON.stringify(result, null, 2));
    
    // Extract signed_id
    const signedId = result.id || result.signed_id || result.data?.id;
    if (signedId) {
      console.log(`\n🎯 Signed ID: ${signedId}`);
      console.log(`\n💡 You can use this signed_id in knowledge base articles!`);
    } else {
      console.log(`\n⚠️  Warning: Could not find signed_id in response`);
      console.log(`   Please check the response structure above`);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.stack) {
      console.error(`\nStack trace:`);
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: node test-upload-native.js <file-path> [token]');
  console.log('\nExample:');
  console.log('  node test-upload-native.js ../README.md');
  console.log('  node test-upload-native.js ../README.md your-api-token');
  console.log('  node test-upload-native.js /path/to/image.jpg\n');
  console.log('Note: Token can also be set via BAKLIB_TOKEN environment variable or .env file\n');
  process.exit(1);
}

testUpload(filePath);


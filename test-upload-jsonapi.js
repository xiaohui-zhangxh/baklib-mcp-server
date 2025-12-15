#!/usr/bin/env node

/**
 * Test script for Baklib file upload using JSON API format
 * Based on server code: Api::Dam::FilesController
 * Uses multipart/form-data with JSON API parameter structure
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
    console.log('🧪 Testing Baklib file upload (JSON API format)...\n');
    
    // Check token
    if (!BAKLIB_TOKEN) {
      console.error('❌ Error: BAKLIB_TOKEN not set');
      console.log('\n💡 Usage: node test-upload-jsonapi.js <file-path> [token]\n');
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

    // Try method 1: Standard multipart/form-data (most common for file uploads)
    console.log('\n📤 Method 1: Standard multipart/form-data');
    console.log('─────────────────────────────────────────');
    
    const formData1 = new FormData();
    formData1.append('file', fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });
    // According to server code, it expects: name, description, file, collection_ids
    // But for simple upload, file should be enough

    console.log(`🚀 Uploading to: ${API_URL}`);
    console.log(`🔑 Using token: ${BAKLIB_TOKEN.substring(0, 10)}...\n`);

    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': BAKLIB_TOKEN,
        ...formData1.getHeaders(),
      },
      body: formData1,
    });

    console.log(`📡 Response status: ${response1.status} ${response1.statusText}`);

    if (response1.ok) {
      const result = await response1.json();
      console.log(`\n✅ Upload successful!\n`);
      console.log('📦 Response:');
      console.log(JSON.stringify(result, null, 2));
      
      const signedId = result.id || result.signed_id || result.data?.id || result.data?.attributes?.signed_id;
      if (signedId) {
        console.log(`\n🎯 Signed ID: ${signedId}`);
        return;
      }
    } else {
      const errorText = await response1.text();
      console.error(`\n❌ Method 1 failed!`);
      console.error(`   Status: ${response1.status}`);
      console.error(`   Error: ${errorText.substring(0, 300)}\n`);
    }

    // Try method 2: JSON API format with data wrapper
    console.log('\n📤 Method 2: JSON API format');
    console.log('─────────────────────────────────────────');
    
    const formData2 = new FormData();
    // JSON API format: wrap in data object
    const jsonApiData = {
      data: {
        type: 'dam_files',
        attributes: {
          file: fileBuffer.toString('base64'), // Base64 encode for JSON
        }
      }
    };
    
    // Actually, for file uploads, we still need multipart/form-data
    // But we can try sending file with JSON API structure in form fields
    formData2.append('data[type]', 'dam_files');
    formData2.append('data[attributes][file]', fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': BAKLIB_TOKEN,
        ...formData2.getHeaders(),
      },
      body: formData2,
    });

    console.log(`📡 Response status: ${response2.status} ${response2.statusText}`);

    if (response2.ok) {
      const result = await response2.json();
      console.log(`\n✅ Upload successful!\n`);
      console.log('📦 Response:');
      console.log(JSON.stringify(result, null, 2));
      
      const signedId = result.id || result.signed_id || result.data?.id || result.data?.attributes?.signed_id;
      if (signedId) {
        console.log(`\n🎯 Signed ID: ${signedId}`);
        return;
      }
    } else {
      const errorText = await response2.text();
      console.error(`\n❌ Method 2 failed!`);
      console.error(`   Status: ${response2.status}`);
      console.error(`   Error: ${errorText.substring(0, 300)}\n`);
    }

    // Try method 3: Direct file parameter (simplest)
    console.log('\n📤 Method 3: Direct file parameter');
    console.log('─────────────────────────────────────────');
    
    const formData3 = new FormData();
    formData3.append('file', fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });
    // Add include_signed_id parameter if needed
    formData3.append('include_signed_id', 'true');

    const response3 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': BAKLIB_TOKEN,
        ...formData3.getHeaders(),
      },
      body: formData3,
    });

    console.log(`📡 Response status: ${response3.status} ${response3.statusText}`);

    if (response3.ok) {
      const result = await response3.json();
      console.log(`\n✅ Upload successful!\n`);
      console.log('📦 Response:');
      console.log(JSON.stringify(result, null, 2));
      
      const signedId = result.id || result.signed_id || result.data?.id || result.data?.attributes?.signed_id;
      if (signedId) {
        console.log(`\n🎯 Signed ID: ${signedId}`);
        return;
      }
    } else {
      const errorText = await response3.text();
      console.error(`\n❌ Method 3 failed!`);
      console.error(`   Status: ${response3.status}`);
      console.error(`   Error: ${errorText.substring(0, 500)}\n`);
    }

    console.log('\n❌ All methods failed. Please check the error messages above.');

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
  console.log('Usage: node test-upload-jsonapi.js <file-path> [token]');
  console.log('\nExample:');
  console.log('  node test-upload-jsonapi.js ../README.md');
  console.log('  node test-upload-jsonapi.js ../README.md your-api-token\n');
  process.exit(1);
}

testUpload(filePath);


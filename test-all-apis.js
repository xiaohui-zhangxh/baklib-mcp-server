#!/usr/bin/env node

/**
 * Test script for Baklib MCP Server APIs
 * Tests all DAM and KB interfaces
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const BAKLIB_TOKEN = process.argv[2] || process.env.BAKLIB_TOKEN || '';
const BAKLIB_API_BASE = 'https://open.baklib.com/api/v1';

if (!BAKLIB_TOKEN) {
  console.error('❌ Error: BAKLIB_TOKEN not set');
  console.log('\n💡 Usage: node test-all-apis.js [token]');
  console.log('   Or set BAKLIB_TOKEN environment variable\n');
  process.exit(1);
}

/**
 * Make API request
 */
async function makeApiRequest(endpoint, method = 'GET', options = {}) {
  const url = new URL(`${BAKLIB_API_BASE}${endpoint}`);
  
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }

  const headers = {
    'Authorization': BAKLIB_TOKEN,
  };

  let body = null;

  if (options.formData) {
    Object.assign(headers, options.formData.getHeaders());
    body = options.formData;
  } else if (options.body) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  console.log(`\n📡 ${method} ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText.substring(0, 200)}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true };
  }

  return await response.json();
}

/**
 * Test result tracker
 */
const testResults = {
  passed: [],
  failed: [],
};

function logTest(name, success, message = '') {
  if (success) {
    console.log(`✅ ${name}`);
    testResults.passed.push(name);
  } else {
    console.log(`❌ ${name}: ${message}`);
    testResults.failed.push({ name, message });
  }
}

/**
 * Test DAM APIs
 */
async function testDAM() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing DAM (Resource Library) APIs');
  console.log('='.repeat(60));

  let uploadedFileId = null;

  // Test 1: Upload file
  try {
    console.log('\n📤 Test 1: Upload file');
    const testFilePath = path.join(process.cwd(), 'test-upload.txt');
    
    // Create test file if not exists
    try {
      await fs.access(testFilePath);
    } catch {
      await fs.writeFile(testFilePath, 'This is a test file for Baklib MCP Server testing.');
    }

    const fileBuffer = await fs.readFile(testFilePath);
    const formData = new FormData();
    formData.append('data[type]', 'dam_files');
    formData.append('data[attributes][file]', fileBuffer, {
      filename: 'test-upload.txt',
      contentType: 'text/plain',
    });

    const result = await makeApiRequest('/dam/files', 'POST', { formData });
    uploadedFileId = result.data?.id;
    
    if (uploadedFileId) {
      logTest('dam_upload_entity', true, `File ID: ${uploadedFileId}`);
    } else {
      logTest('dam_upload_entity', false, 'No file ID returned');
    }
  } catch (error) {
    logTest('dam_upload_entity', false, error.message);
  }

  // Test 2: Get file
  if (uploadedFileId) {
    try {
      console.log('\n📥 Test 2: Get file');
      const result = await makeApiRequest(`/dam/entities/${uploadedFileId}`, 'GET');
      if (result.data) {
        logTest('dam_get_entity', true);
      } else {
        logTest('dam_get_entity', false, 'No data returned');
      }
    } catch (error) {
      logTest('dam_get_entity', false, error.message);
    }
  } else {
    logTest('dam_get_entity', false, 'Skipped: No file ID from upload');
  }

  // Test 3: Update file
  if (uploadedFileId) {
    try {
      console.log('\n✏️  Test 3: Update file');
      const body = {
        data: {
          type: 'dam_files',
          id: uploadedFileId,
          attributes: {
            name: 'test-upload-updated.txt',
            description: 'Updated test file',
          },
        },
      };
      const result = await makeApiRequest(`/dam/files/${uploadedFileId}`, 'PATCH', { body });
      if (result.data) {
        logTest('dam_update_entity', true);
      } else {
        logTest('dam_update_entity', false, 'No data returned');
      }
    } catch (error) {
      logTest('dam_update_entity', false, error.message);
    }
  } else {
    logTest('dam_update_entity', false, 'Skipped: No file ID from upload');
  }

  // Test 4: List files
  try {
    console.log('\n📋 Test 4: List files');
    const result = await makeApiRequest('/dam/entities', 'GET', {
      query: { 'page[number]': 1, 'page[size]': 10 },
    });
    if (result.data) {
      logTest('dam_list_entities', true, `Found ${result.data.length || 0} files`);
    } else {
      logTest('dam_list_entities', false, 'No data returned');
    }
  } catch (error) {
    logTest('dam_list_entities', false, error.message);
  }

  // Test 5: Delete file (cleanup)
  if (uploadedFileId) {
    try {
      console.log('\n🗑️  Test 5: Delete file (cleanup)');
      await makeApiRequest(`/dam/entities/${uploadedFileId}`, 'DELETE');
      logTest('dam_delete_entity', true);
    } catch (error) {
      logTest('dam_delete_entity', false, error.message);
    }
  } else {
    logTest('dam_delete_entity', false, 'Skipped: No file ID from upload');
  }

  return uploadedFileId;
}

/**
 * Test KB APIs
 */
async function testKB() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing KB (Knowledge Base) APIs');
  console.log('='.repeat(60));

  let knowledgeBaseId = null;
  let articleId = null;

  // Test 1: List knowledge bases
  try {
    console.log('\n📚 Test 1: List knowledge bases');
    const result = await makeApiRequest('/kb/spaces', 'GET', {
      query: { 'page[number]': 1, 'page[size]': 10 },
    });
    
    if (result.data && result.data.length > 0) {
      knowledgeBaseId = result.data[0].id;
      logTest('kb_list_knowledge_bases', true, `Found ${result.data.length} knowledge bases, using first one: ${knowledgeBaseId}`);
    } else {
      logTest('kb_list_knowledge_bases', false, 'No knowledge bases found');
    }
  } catch (error) {
    logTest('kb_list_knowledge_bases', false, error.message);
  }

  // Test 2: Get knowledge base
  if (knowledgeBaseId) {
    try {
      console.log('\n📖 Test 2: Get knowledge base');
      const result = await makeApiRequest(`/kb/spaces/${knowledgeBaseId}`, 'GET');
      if (result.data) {
        logTest('kb_get_knowledge_base', true);
      } else {
        logTest('kb_get_knowledge_base', false, 'No data returned');
      }
    } catch (error) {
      logTest('kb_get_knowledge_base', false, error.message);
    }
  } else {
    logTest('kb_get_knowledge_base', false, 'Skipped: No knowledge base ID');
  }

  // Test 3: Create article
  if (knowledgeBaseId) {
    try {
      console.log('\n📝 Test 3: Create article');
      const body = {
        data: {
          attributes: {
            title: 'MCP Server Test Article',
            body: '<h1>Test Article</h1><p>This is a test article created by MCP Server test script.</p>',
          },
        },
      };
      const result = await makeApiRequest(`/kb/spaces/${knowledgeBaseId}/articles`, 'POST', { body });
      articleId = result.data?.id;
      
      if (articleId) {
        logTest('kb_create_article', true, `Article ID: ${articleId}`);
      } else {
        logTest('kb_create_article', false, 'No article ID returned');
      }
    } catch (error) {
      logTest('kb_create_article', false, error.message);
    }
  } else {
    logTest('kb_create_article', false, 'Skipped: No knowledge base ID');
  }

  // Test 4: Get article
  if (articleId && knowledgeBaseId) {
    try {
      console.log('\n📄 Test 4: Get article');
      const result = await makeApiRequest(`/kb/spaces/${knowledgeBaseId}/articles/${articleId}`, 'GET');
      if (result.data) {
        logTest('kb_get_article', true);
      } else {
        logTest('kb_get_article', false, 'No data returned');
      }
    } catch (error) {
      logTest('kb_get_article', false, error.message);
    }
    } else {
      logTest('kb_get_article', false, 'Skipped: No article ID or knowledge base ID from create');
    }

  // Test 5: Update article
  if (articleId && knowledgeBaseId) {
    try {
      console.log('\n✏️  Test 5: Update article');
      const body = {
        data: {
          attributes: {
            title: 'MCP Server Test Article (Updated)',
            body: '<h1>Updated Test Article</h1><p>This article has been updated by MCP Server test script.</p>',
          },
        },
      };
      const result = await makeApiRequest(`/kb/spaces/${knowledgeBaseId}/articles/${articleId}`, 'PATCH', { body });
      if (result.data) {
        logTest('kb_update_article', true);
      } else {
        logTest('kb_update_article', false, 'No data returned');
      }
    } catch (error) {
      logTest('kb_update_article', false, error.message);
    }
    } else {
      logTest('kb_update_article', false, 'Skipped: No article ID or knowledge base ID from create');
    }

  // Test 6: List articles
  if (knowledgeBaseId) {
    try {
      console.log('\n📋 Test 6: List articles');
      const result = await makeApiRequest(`/kb/spaces/${knowledgeBaseId}/articles`, 'GET', {
        query: {
          'page[number]': 1,
          'page[size]': 10,
        },
      });
      if (result.data) {
        logTest('kb_list_articles', true, `Found ${result.data.length || 0} articles`);
      } else {
        logTest('kb_list_articles', false, 'No data returned');
      }
    } catch (error) {
      logTest('kb_list_articles', false, error.message);
    }
  } else {
    logTest('kb_list_articles', false, 'Skipped: No knowledge base ID');
  }

  // Test 7: Delete article (cleanup)
  if (articleId && knowledgeBaseId) {
    try {
      console.log('\n🗑️  Test 7: Delete article (cleanup)');
      await makeApiRequest(`/kb/spaces/${knowledgeBaseId}/articles/${articleId}`, 'DELETE');
      logTest('kb_delete_article', true);
    } catch (error) {
      logTest('kb_delete_article', false, error.message);
    }
    } else {
      logTest('kb_delete_article', false, 'Skipped: No article ID or knowledge base ID from create');
    }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Starting Baklib MCP Server API Tests');
  console.log(`🔑 Using token: ${BAKLIB_TOKEN.substring(0, 10)}...`);

  try {
    // Test DAM APIs
    await testDAM();

    // Test KB APIs
    await testKB();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    
    if (testResults.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.failed.forEach(({ name, message }) => {
        console.log(`   - ${name}: ${message}`);
      });
    }

    if (testResults.failed.length === 0) {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();


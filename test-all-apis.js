#!/usr/bin/env node

/**
 * Test script for Baklib MCP Server APIs
 * Tests all DAM and KB interfaces
 */

import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import { readBaklibMcpConfig } from './lib/config.js';

const config = await readBaklibMcpConfig();
const BAKLIB_TOKEN = process.argv[2] || config.token || '';
const BAKLIB_API_BASE = config.apiBase;

if (!BAKLIB_TOKEN) {
  console.error('❌ Error: BAKLIB_MCP_TOKEN not set');
  console.log('\n💡 Usage: node test-all-apis.js [token]');
  console.log('   Or configure it via ENV or ~/.config/\n');
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
      // Query params: include_signed_id + purpose (image_picker / video_picker / dynamic_form)
      const withSigned = await makeApiRequest(`/dam/entities/${uploadedFileId}`, 'GET', {
        query: { include_signed_id: 'true', purpose: 'dynamic_form' },
      });
      if (withSigned.data) {
        logTest('dam_get_entity (include_signed_id + purpose)', true);
      } else {
        logTest('dam_get_entity (include_signed_id + purpose)', false, 'No data returned');
      }
    } catch (error) {
      logTest('dam_get_entity', false, error.message);
    }

    // Test 2b: Entity portal URL
    try {
      console.log('\n🔗 Test 2b: POST entity URL');
      const urlRes = await makeApiRequest(`/dam/entities/${uploadedFileId}/urls`, 'POST', {
        body: { expires_in: 3600 },
      });
      if (urlRes.url) {
        logTest('dam_create_entity_url', true);
      } else {
        logTest('dam_create_entity_url', false, 'No url in response');
      }
    } catch (error) {
      logTest('dam_create_entity_url', false, error.message);
    }
  } else {
    logTest('dam_get_entity', false, 'Skipped: No file ID from upload');
    logTest('dam_create_entity_url', false, 'Skipped: No file ID from upload');
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

  // Test 4a: Collections list + limits
  try {
    console.log('\n📚 Test 4a: DAM collections');
    const coll = await makeApiRequest('/dam/collections', 'GET', {
      query: { 'page[number]': 1, 'page[size]': 5 },
    });
    if (coll.data !== undefined) {
      logTest('dam_list_collections', true);
    } else {
      logTest('dam_list_collections', false, 'No data');
    }
    const lim = await makeApiRequest('/dam/collections/limits', 'GET');
    if (lim.data) {
      logTest('dam_get_collection_limits', true);
    } else {
      logTest('dam_get_collection_limits', false, 'No data');
    }
  } catch (error) {
    logTest('dam_list_collections', false, error.message);
    logTest('dam_get_collection_limits', false, error.message);
  }

  let fragmentId = null;
  try {
    console.log('\n📝 Test 4b: Create DAM knowledge fragment');
    const fragBody = {
      data: {
        type: 'dam_fragments',
        attributes: {
          name: 'MCP API Test Fragment',
          body: '# MCP test\n\nTemporary fragment from baklib-mcp-server test-all-apis.',
          body_format: 'markdown',
        },
      },
    };
    const fragResult = await makeApiRequest('/dam/fragments', 'POST', {
      body: fragBody,
      query: { body_format: 'markdown' },
    });
    fragmentId = fragResult.data?.id;
    if (fragmentId) {
      logTest('dam_create_fragment', true, `Fragment entity id: ${fragmentId}`);
    } else {
      logTest('dam_create_fragment', false, 'No fragment id returned');
    }
  } catch (error) {
    logTest('dam_create_fragment', false, error.message);
  }

  if (fragmentId) {
    try {
      console.log('\n✏️  Test 4b2: Update DAM fragment');
      const patchBody = {
        data: {
          type: 'dam_entities',
          attributes: { name: 'MCP API Test Fragment (patched)' },
        },
      };
      const patchRes = await makeApiRequest(`/dam/fragments/${fragmentId}`, 'PATCH', {
        body: patchBody,
        query: { body_format: 'markdown' },
      });
      if (patchRes.data) {
        logTest('dam_update_fragment', true);
      } else {
        logTest('dam_update_fragment', false, 'No data');
      }
    } catch (error) {
      logTest('dam_update_fragment', false, error.message);
    }
  } else {
    logTest('dam_update_fragment', false, 'Skipped: no fragment id');
  }

  let linkEntityId = null;
  try {
    console.log('\n🔗 Test 4d: Create DAM link');
    const linkBody = {
      data: {
        type: 'dam_entities',
        attributes: {
          name: 'MCP Test Link',
          url: 'https://example.com/mcp-test',
        },
      },
    };
    const linkRes = await makeApiRequest('/dam/links', 'POST', { body: linkBody });
    linkEntityId = linkRes.data?.id;
    if (linkEntityId) {
      logTest('dam_create_link', true, `Link entity id: ${linkEntityId}`);
    } else {
      logTest('dam_create_link', false, 'No id returned');
    }
  } catch (error) {
    logTest('dam_create_link', false, error.message);
  }

  if (linkEntityId) {
    try {
      console.log('\n✏️  Test 4e: Update DAM link');
      const ubody = {
        data: {
          type: 'dam_entities',
          attributes: { name: 'MCP Test Link Updated' },
        },
      };
      const ures = await makeApiRequest(`/dam/links/${linkEntityId}`, 'PATCH', { body: ubody });
      if (ures.data) {
        logTest('dam_update_link', true);
      } else {
        logTest('dam_update_link', false, 'No data');
      }
    } catch (error) {
      logTest('dam_update_link', false, error.message);
    }
    try {
      await makeApiRequest(`/dam/entities/${linkEntityId}`, 'DELETE');
      logTest('dam_delete_entity (link cleanup)', true);
    } catch (error) {
      logTest('dam_delete_entity (link cleanup)', false, error.message);
    }
  } else {
    logTest('dam_update_link', false, 'Skipped: no link id');
    logTest('dam_delete_entity (link cleanup)', false, 'Skipped: no link id');
  }

  if (fragmentId) {
    try {
      console.log('\n🗑️  Test 4c: Delete DAM fragment (cleanup)');
      await makeApiRequest(`/dam/entities/${fragmentId}`, 'DELETE');
      logTest('dam_delete_entity (fragment cleanup)', true);
    } catch (error) {
      logTest('dam_delete_entity (fragment cleanup)', false, error.message);
    }
  } else {
    logTest('dam_delete_entity (fragment cleanup)', false, 'Skipped: no fragment id');
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
 * Test User APIs (GET /users, GET /user)
 */
async function testUsers() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing User APIs');
  console.log('='.repeat(60));

  try {
    console.log('\n👥 GET /users');
    const result = await makeApiRequest('/users', 'GET', {
      query: { 'page[number]': 1, 'page[size]': 5 },
    });
    if (result.data !== undefined) {
      logTest('user_list_users', true);
    } else {
      logTest('user_list_users', false, 'No data');
    }
  } catch (error) {
    logTest('user_list_users', false, error.message);
  }

  try {
    console.log('\n👤 GET /user');
    const result = await makeApiRequest('/user', 'GET');
    if (result.data) {
      logTest('user_get_current', true);
    } else {
      logTest('user_get_current', false, 'No data');
    }
  } catch (error) {
    logTest('user_get_current', false, error.message);
  }
}

/**
 * Test site tag PATCH when a site and tag exist
 */
async function testSiteTagsUpdate() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing Site tag update (PATCH)');
  console.log('='.repeat(60));

  let siteId = null;
  try {
    const sites = await makeApiRequest('/sites', 'GET', {
      query: { 'page[number]': 1, 'page[size]': 5 },
    });
    if (sites.data && sites.data.length > 0) {
      siteId = sites.data[0].id;
    }
  } catch {
    /* skip */
  }

  if (!siteId) {
    logTest('site_update_tag', false, 'Skipped: no site from /sites');
    return;
  }

  let tagId = null;
  try {
    const tags = await makeApiRequest(`/sites/${siteId}/tags`, 'GET', {
      query: { 'page[number]': 1, 'page[size]': 10 },
    });
    if (tags.data && tags.data.length > 0) {
      tagId = tags.data[0].id;
    }
  } catch {
    /* skip */
  }

  if (!tagId) {
    logTest('site_update_tag', false, 'Skipped: no tags on first site');
    return;
  }

  try {
    const body = {
      data: {
        attributes: { name: `mcp-patch-${Date.now()}` },
      },
    };
    const result = await makeApiRequest(`/sites/${siteId}/tags/${tagId}`, 'PATCH', { body });
    if (result.data || result.name || result.id) {
      logTest('site_update_tag', true);
    } else {
      logTest('site_update_tag', false, 'Unexpected response');
    }
  } catch (error) {
    logTest('site_update_tag', false, error.message);
  }
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

    await testUsers();
    await testSiteTagsUpdate();

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


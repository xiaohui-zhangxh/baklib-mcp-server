/**
 * Tools Index
 * 
 * Exports all tool definitions and handlers
 */

// DAM Tools
export { toolDefinition as damUploadEntity, handleTool as handleDamUploadEntity } from './dam-upload-entity.js';
export { toolDefinition as damGetEntity, handleTool as handleDamGetEntity } from './dam-get-entity.js';
export { toolDefinition as damUpdateEntity, handleTool as handleDamUpdateEntity } from './dam-update-entity.js';
export { toolDefinition as damDeleteEntity, handleTool as handleDamDeleteEntity } from './dam-delete-entity.js';
export { toolDefinition as damListEntities, handleTool as handleDamListEntities } from './dam-list-entities.js';

// KB Tools
export { toolDefinition as kbCreateArticle, handleTool as handleKbCreateArticle } from './kb-create-article.js';
export { toolDefinition as kbGetArticle, handleTool as handleKbGetArticle } from './kb-get-article.js';
export { toolDefinition as kbUpdateArticle, handleTool as handleKbUpdateArticle } from './kb-update-article.js';
export { toolDefinition as kbDeleteArticle, handleTool as handleKbDeleteArticle } from './kb-delete-article.js';
export { toolDefinition as kbListArticles, handleTool as handleKbListArticles } from './kb-list-articles.js';
export { toolDefinition as kbListKnowledgeBases, handleTool as handleKbListKnowledgeBases } from './kb-list-knowledge-bases.js';
export { toolDefinition as kbGetKnowledgeBase, handleTool as handleKbGetKnowledgeBase } from './kb-get-knowledge-base.js';

// Site Pages Tools
export { toolDefinition as siteListPages, handleTool as handleSiteListPages } from './site-list-pages.js';
export { toolDefinition as siteCreatePage, handleTool as handleSiteCreatePage } from './site-create-page.js';
export { toolDefinition as siteGetPage, handleTool as handleSiteGetPage } from './site-get-page.js';
export { toolDefinition as siteUpdatePage, handleTool as handleSiteUpdatePage } from './site-update-page.js';
export { toolDefinition as siteDeletePage, handleTool as handleSiteDeletePage } from './site-delete-page.js';

// Site Tags Tools
export { toolDefinition as siteListTags, handleTool as handleSiteListTags } from './site-list-tags.js';
export { toolDefinition as siteCreateTag, handleTool as handleSiteCreateTag } from './site-create-tag.js';
export { toolDefinition as siteGetTag, handleTool as handleSiteGetTag } from './site-get-tag.js';
export { toolDefinition as siteDeleteTag, handleTool as handleSiteDeleteTag } from './site-delete-tag.js';

/**
 * Get all tool definitions
 */
export function getAllToolDefinitions() {
  return [
    // DAM Tools
    damUploadEntity,
    damGetEntity,
    damUpdateEntity,
    damDeleteEntity,
    damListEntities,
    // KB Tools
    kbCreateArticle,
    kbGetArticle,
    kbUpdateArticle,
    kbDeleteArticle,
    kbListArticles,
    kbListKnowledgeBases,
    kbGetKnowledgeBase,
    // Site Pages Tools
    siteListPages,
    siteCreatePage,
    siteGetPage,
    siteUpdatePage,
    siteDeletePage,
    // Site Tags Tools
    siteListTags,
    siteCreateTag,
    siteGetTag,
    siteDeleteTag,
  ];
}

/**
 * Get tool handler by name
 */
export function getToolHandler(toolName) {
  const handlers = {
    // DAM Tools
    'dam_upload_entity': handleDamUploadEntity,
    'dam_get_entity': handleDamGetEntity,
    'dam_update_entity': handleDamUpdateEntity,
    'dam_delete_entity': handleDamDeleteEntity,
    'dam_list_entities': handleDamListEntities,
    // KB Tools
    'kb_create_article': handleKbCreateArticle,
    'kb_get_article': handleKbGetArticle,
    'kb_update_article': handleKbUpdateArticle,
    'kb_delete_article': handleKbDeleteArticle,
    'kb_list_articles': handleKbListArticles,
    'kb_list_knowledge_bases': handleKbListKnowledgeBases,
    'kb_get_knowledge_base': handleKbGetKnowledgeBase,
    // Site Pages Tools
    'site_list_pages': handleSiteListPages,
    'site_create_page': handleSiteCreatePage,
    'site_get_page': handleSiteGetPage,
    'site_update_page': handleSiteUpdatePage,
    'site_delete_page': handleSiteDeletePage,
    // Site Tags Tools
    'site_list_tags': handleSiteListTags,
    'site_create_tag': handleSiteCreateTag,
    'site_get_tag': handleSiteGetTag,
    'site_delete_tag': handleSiteDeleteTag,
  };
  return handlers[toolName];
}


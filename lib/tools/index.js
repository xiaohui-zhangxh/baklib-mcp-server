/**
 * Tools Index
 *
 * Exports all tool definitions and handlers
 */

// DAM Tools
import { toolDefinition as damUploadEntity, handleTool as handleDamUploadEntity } from './dam-upload-entity.js';
import { toolDefinition as damGetEntity, handleTool as handleDamGetEntity } from './dam-get-entity.js';
import { toolDefinition as damUpdateEntity, handleTool as handleDamUpdateEntity } from './dam-update-entity.js';
import { toolDefinition as damDeleteEntity, handleTool as handleDamDeleteEntity } from './dam-delete-entity.js';
import { toolDefinition as damListEntities, handleTool as handleDamListEntities } from './dam-list-entities.js';
import { toolDefinition as damCreateFragment, handleTool as handleDamCreateFragment } from './dam-create-fragment.js';
import { toolDefinition as damCreateEntityUrl, handleTool as handleDamCreateEntityUrl } from './dam-create-entity-url.js';
import { toolDefinition as damUpdateFragment, handleTool as handleDamUpdateFragment } from './dam-update-fragment.js';
import { toolDefinition as damCreateLink, handleTool as handleDamCreateLink } from './dam-create-link.js';
import { toolDefinition as damUpdateLink, handleTool as handleDamUpdateLink } from './dam-update-link.js';
import { toolDefinition as damListCollections, handleTool as handleDamListCollections } from './dam-list-collections.js';
import { toolDefinition as damGetCollectionLimits, handleTool as handleDamGetCollectionLimits } from './dam-get-collection-limits.js';

// KB Tools
import { toolDefinition as kbCreateArticle, handleTool as handleKbCreateArticle } from './kb-create-article.js';
import { toolDefinition as kbGetArticle, handleTool as handleKbGetArticle } from './kb-get-article.js';
import { toolDefinition as kbUpdateArticle, handleTool as handleKbUpdateArticle } from './kb-update-article.js';
import { toolDefinition as kbDeleteArticle, handleTool as handleKbDeleteArticle } from './kb-delete-article.js';
import { toolDefinition as kbListArticles, handleTool as handleKbListArticles } from './kb-list-articles.js';
import { toolDefinition as kbListKnowledgeBases, handleTool as handleKbListKnowledgeBases } from './kb-list-knowledge-bases.js';
import { toolDefinition as kbGetKnowledgeBase, handleTool as handleKbGetKnowledgeBase } from './kb-get-knowledge-base.js';

// Site Pages Tools
import { toolDefinition as siteListPages, handleTool as handleSiteListPages } from './site-list-pages.js';
import { toolDefinition as siteCreatePage, handleTool as handleSiteCreatePage } from './site-create-page.js';
import { toolDefinition as siteGetPage, handleTool as handleSiteGetPage } from './site-get-page.js';
import { toolDefinition as siteUpdatePage, handleTool as handleSiteUpdatePage } from './site-update-page.js';
import { toolDefinition as siteDeletePage, handleTool as handleSiteDeletePage } from './site-delete-page.js';

// Site Tags Tools
import { toolDefinition as siteListTags, handleTool as handleSiteListTags } from './site-list-tags.js';
import { toolDefinition as siteCreateTag, handleTool as handleSiteCreateTag } from './site-create-tag.js';
import { toolDefinition as siteGetTag, handleTool as handleSiteGetTag } from './site-get-tag.js';
import { toolDefinition as siteUpdateTag, handleTool as handleSiteUpdateTag } from './site-update-tag.js';
import { toolDefinition as siteDeleteTag, handleTool as handleSiteDeleteTag } from './site-delete-tag.js';

// Site Management Tools
import { toolDefinition as siteListSites, handleTool as handleSiteListSites } from './site-list-sites.js';
import { toolDefinition as siteGetSite, handleTool as handleSiteGetSite } from './site-get-site.js';

// Theme Tools
import { toolDefinition as themeListThemes, handleTool as handleThemeListThemes } from './theme-list-themes.js';

// Member Tools
import { toolDefinition as memberListMembers, handleTool as handleMemberListMembers } from './member-list-members.js';
import { toolDefinition as memberGetMember, handleTool as handleMemberGetMember } from './member-get-member.js';

// User Tools
import { toolDefinition as userListUsers, handleTool as handleUserListUsers } from './user-list-users.js';
import { toolDefinition as userGetCurrent, handleTool as handleUserGetCurrent } from './user-get-current.js';

// Re-export for external use
export {
  // DAM Tools
  damUploadEntity,
  handleDamUploadEntity,
  damGetEntity,
  handleDamGetEntity,
  damUpdateEntity,
  handleDamUpdateEntity,
  damDeleteEntity,
  handleDamDeleteEntity,
  damListEntities,
  handleDamListEntities,
  damCreateFragment,
  handleDamCreateFragment,
  damCreateEntityUrl,
  handleDamCreateEntityUrl,
  damUpdateFragment,
  handleDamUpdateFragment,
  damCreateLink,
  handleDamCreateLink,
  damUpdateLink,
  handleDamUpdateLink,
  damListCollections,
  handleDamListCollections,
  damGetCollectionLimits,
  handleDamGetCollectionLimits,
  // KB Tools
  kbCreateArticle,
  handleKbCreateArticle,
  kbGetArticle,
  handleKbGetArticle,
  kbUpdateArticle,
  handleKbUpdateArticle,
  kbDeleteArticle,
  handleKbDeleteArticle,
  kbListArticles,
  handleKbListArticles,
  kbListKnowledgeBases,
  handleKbListKnowledgeBases,
  kbGetKnowledgeBase,
  handleKbGetKnowledgeBase,
  // Site Pages Tools
  siteListPages,
  handleSiteListPages,
  siteCreatePage,
  handleSiteCreatePage,
  siteGetPage,
  handleSiteGetPage,
  siteUpdatePage,
  handleSiteUpdatePage,
  siteDeletePage,
  handleSiteDeletePage,
  // Site Tags Tools
  siteListTags,
  handleSiteListTags,
  siteCreateTag,
  handleSiteCreateTag,
  siteGetTag,
  handleSiteGetTag,
  siteUpdateTag,
  handleSiteUpdateTag,
  siteDeleteTag,
  handleSiteDeleteTag,
  // Site Management Tools
  siteListSites,
  handleSiteListSites,
  siteGetSite,
  handleSiteGetSite,
  // Theme Tools
  themeListThemes,
  handleThemeListThemes,
  // Member Tools
  memberListMembers,
  handleMemberListMembers,
  memberGetMember,
  handleMemberGetMember,
  // User Tools
  userListUsers,
  handleUserListUsers,
  userGetCurrent,
  handleUserGetCurrent,
};

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
    damCreateFragment,
    damCreateEntityUrl,
    damUpdateFragment,
    damCreateLink,
    damUpdateLink,
    damListCollections,
    damGetCollectionLimits,
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
    siteUpdateTag,
    siteDeleteTag,
    // Site Management Tools
    siteListSites,
    siteGetSite,
    // Theme Tools
    themeListThemes,
    // Member Tools
    memberListMembers,
    memberGetMember,
    // User Tools
    userListUsers,
    userGetCurrent,
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
    'dam_create_fragment': handleDamCreateFragment,
    'dam_create_entity_url': handleDamCreateEntityUrl,
    'dam_update_fragment': handleDamUpdateFragment,
    'dam_create_link': handleDamCreateLink,
    'dam_update_link': handleDamUpdateLink,
    'dam_list_collections': handleDamListCollections,
    'dam_get_collection_limits': handleDamGetCollectionLimits,
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
    'site_update_tag': handleSiteUpdateTag,
    'site_delete_tag': handleSiteDeleteTag,
    // Site Management Tools
    'site_list_sites': handleSiteListSites,
    'site_get_site': handleSiteGetSite,
    // Theme Tools
    'theme_list_themes': handleThemeListThemes,
    // Member Tools
    'member_list_members': handleMemberListMembers,
    'member_get_member': handleMemberGetMember,
    // User Tools
    'user_list_users': handleUserListUsers,
    'user_get_current': handleUserGetCurrent,
  };
  return handlers[toolName];
}

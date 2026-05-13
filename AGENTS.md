# AGENTS.md

This file provides context and instructions for AI coding agents working on the Baklib MCP Server project.

## Project Overview

Baklib MCP Server is a Model Context Protocol (MCP) server that enables AI assistants to interact with Baklib's Digital Asset Management (DAM) and Knowledge Base (KB) APIs.

**Key Features**:
- DAM operations: file CRUD and listing, temporary signed URLs, knowledge fragments, web links, collections and collection limits (12 MCP tools; see `lib/tools/index.js`)
- KB operations: create, retrieve, update, delete articles, and list/get knowledge bases (7 MCP tools; KB space admin and `GET /kb/spaces/.../limits` are out of scope)
- Sites: page CRUD, tag CRUD (including tag update), site list/detail; no MCP for site create/update or page `smart_create` / draft / versions extensions
- Users and members: list users, current user, list/get members (read-only for members)
- Themes: list themes
- Support for private deployments via `BAKLIB_MCP_API_BASE` (loaded from `~/.config/` or ENV)

## Setup Commands

- **Install dependencies**: `npm install`
- **Start MCP server**: `npm start` or `node index.js`
- **Check Node.js version**: Requires Node.js >= 18.0.0

## Configuration

The server loads configuration with fixed precedence: command ENV > user `~/.config/`.

- **Required**: `BAKLIB_MCP_TOKEN` (format: `access_key:secret_key`)
- **Optional**: `BAKLIB_MCP_API_BASE` (default: `https://open.baklib.com/api/v1`)

Recommended setup:

```bash
mkdir -p ~/.config
printf "%s\n" "your-api-token-here" > ~/.config/BAKLIB_MCP_TOKEN
```

## Development Environment Tips

- The project uses ES modules (`"type": "module"` in package.json), so use `import`/`export` syntax, not `require()`.
- Main entry point is `index.js` with shebang `#!/usr/bin/env node` for CLI execution.
- MCP server uses `@modelcontextprotocol/sdk` for protocol implementation.
- API requests use JSON API format for file uploads (`data[type]` and `data[attributes][file]`).
- Authorization header does NOT use `Bearer` prefix - token is sent directly.

## Testing Instructions

### Run All API Tests

```bash
# Test all implemented API endpoints
node test-all-apis.js your-api-token
```

### Test Individual Features

```bash
# Test file upload (JSON API format)
node test-upload-jsonapi.js file-path your-api-token

# Test file upload (native format)
node test-upload-native.js file-path your-api-token

# Test file upload (basic format)
node test-upload.js file-path
```

### Testing Checklist

Before committing, ensure:
- [ ] All API endpoints work correctly
- [ ] File uploads succeed and return correct `signed_id`
- [ ] Error handling works for invalid tokens, missing files, etc.
- [ ] `BAKLIB_MCP_API_BASE` can override default API URL
- [ ] No hardcoded tokens or sensitive information in code

## Code Style

- **JavaScript ES Modules**: Use `import`/`export`, not CommonJS `require()`.
- **Async/Await**: Prefer async/await over promises for better readability.
- **Error Handling**: Always handle errors with try/catch and return meaningful error messages.
- **Comments**: Add comments for complex logic, especially API request formatting.
- **Function Naming**: Use descriptive names like `uploadFileToBaklib()`, `makeApiRequest()`.
- **Constants**: Use `const` for configuration values (e.g., `BAKLIB_MCP_API_BASE`).

## File Structure

```
baklib-mcp-server/
├── index.js                    # Main MCP server implementation
├── package.json                # Package configuration
├── mcp-config-example.json     # Example Cursor MCP configuration
├── README.md                   # User-facing documentation
├── DEVELOPER.md                # Developer documentation
├── PUBLISH.md                  # Publishing guide
├── test-all-apis.js           # Comprehensive API test script
├── test-upload-*.js           # Individual test scripts
└── api.json                    # Baklib API documentation (reference only)
```

## API Implementation Guidelines

### Current Implementation Status

- ✅ **DAM (Resource Library)**: Full set aligned with [API-STATUS.md](./API-STATUS.md)—upload, list, get, update, delete entities; create fragment; update fragment; create entity URL; create/update link; list collections; get collection limits (**12 tools**).
- ✅ **KB (Knowledge Base)**: Article CRUD and knowledge base list/detail (**7 tools**)
  - ❌ Knowledge base management (create/update/delete): Not implemented due to security and management considerations
  - ❌ `GET /kb/spaces/{space_id}/limits`: Not exposed as an MCP tool
- ✅ **Sites**: Page CRUD; tag CRUD including `site_update_tag`; site list/detail only (no site create/update MCP)
  - ❌ Page extensions such as `smart_create`, draft, and versions: Not in MCP scope
- ✅ **Users / members / themes**: `user_list_users`, `user_get_current`; member list/get; `theme_list_themes`
- ✅ **Config File Support**: `BAKLIB_MCP_API_BASE` for private deployments
- **Tool count**: **37** tools registered in [`lib/tools/index.js`](lib/tools/index.js); keep [API-STATUS.md](./API-STATUS.md) and this section in sync when adding tools

### API Request Format

- **File Upload**: Use JSON API format with `data[type]` and `data[attributes][file]`
- **Authorization**: Send token directly in `Authorization` header (no `Bearer` prefix)
- **Base URL**: Configurable via `BAKLIB_MCP_API_BASE` (loaded from `~/.config/` or ENV)
- **Error Handling**: Return user-friendly error messages from API responses

### Adding New Tools

When adding new MCP tools:
1. Add a module under `lib/tools/` (tool schema + `handleTool`); register it in [`lib/tools/index.js`](lib/tools/index.js) (`getAllToolDefinitions` and `getToolHandler`).
2. `index.js` already wires `ListToolsRequestSchema` / `CallToolRequestSchema` to those exports—no duplicate definitions in the root file.
3. Update [`DEVELOPER.md`](DEVELOPER.md) and [`API-STATUS.md`](API-STATUS.md) with implementation status.
4. Add test cases to `test-all-apis.js` where applicable.

## Security Considerations

- **Never commit**:
  - `.env` files
  - `.config/` files (may contain tokens)
  - Real API tokens
  - User-specific paths
  - Test result files with sensitive data

- **Always use**:
  - Environment variables for configuration
  - Generic paths in examples (e.g., `/path/to/file`)
  - Placeholder tokens in documentation (`your-api-token-here`)

- **Before publishing**:
  - Run security check: `grep -r "ifJyMBLkXc3BjidjviKxK5ps\|ce5f586f320645988c1d5b353c23eaac" .`
  - Verify `.npmignore` excludes test files and sensitive data
  - Check `package.json` for correct version and metadata

## Publishing Process

### Pre-Publishing Checklist

- [ ] Version number updated in `package.json` and `index.js`
- [ ] All tests pass
- [ ] No sensitive information in code or documentation
- [ ] `.npmignore` correctly configured
- [ ] `npm pack --dry-run` shows only intended files
- [ ] README.md is user-facing and complete
- [ ] DEVELOPER.md has latest API implementation status

### Publishing Commands

```bash
# 1. Verify package contents
npm pack --dry-run

# 2. Create package tarball for inspection
npm pack

# 3. Publish to npm (first time)
npm publish --access public

# 4. Update version and publish (subsequent releases)
npm version patch && npm publish
```

**Note**: Package name is `@baklib/baklib-mcp-server` (scoped package), requires `--access public` for first publish.

## PR Instructions

- **Title format**: `[Feature/Fix] Brief description`
- **Before committing**:
  - Run `npm pack --dry-run` to verify files
  - Check for hardcoded tokens or paths
  - Ensure all environment variables are documented
  - Update `DEVELOPER.md` if API implementation status changes

- **Code changes**:
  - Follow existing code style (ES modules, async/await)
  - Add error handling for all API calls
  - Update tests if adding new functionality
  - Keep user-facing and developer documentation in sync

## Common Tasks

### Adding a New API Endpoint

1. Check `api.json` for endpoint specification
2. Implement the tool in `lib/tools/<name>.js` and register it in [`lib/tools/index.js`](lib/tools/index.js)
3. Add test case in `test-all-apis.js`
4. Update `DEVELOPER.md` and `API-STATUS.md` API implementation status tables

### Updating Version

1. Update `package.json` version
2. Update `index.js` server version (in `new Server()` call)
3. Update `package-lock.json` (run `npm install`)
4. Update `README.md` changelog section
5. Update `PUBLISH.md` version examples

### Debugging API Issues

1. Check `BAKLIB_MCP_TOKEN` is set correctly (format: `access_key:secret_key`)
2. Verify `BAKLIB_MCP_API_BASE` if using private deployment
3. Check API endpoint URLs match Baklib API documentation
4. Review request format (JSON API for uploads, direct token for auth)
5. Test with `test-all-apis.js` script for comprehensive verification

## References

- [Baklib API Documentation](https://dev.baklib.cn/api)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [AGENTS.md Standard](https://agents.md/)
- [npm Publishing Guide](./PUBLISH.md)
- [Developer Documentation](./DEVELOPER.md)


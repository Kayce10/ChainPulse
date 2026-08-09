#!/usr/bin/env node

const { execSync } = require('child_process');

const issues = [
  // PHASE 1: BACKEND REFACTORING (20 issues)
  {
    title: '[Backend] Implement Network Context Middleware',
    body: `## Project Context
This task is part of Phase 1: Backend Refactoring for the Stellar Insights multi-network architecture. The goal is to enable runtime network switching between testnet and mainnet.

## Task Type
- [x] Backend
- [x] Feature
- [ ] Bug Fix

## Action Required
- [x] Create New File(s)
- [x] Update Existing File(s)

## File Locations Involved

### New Files
\`\`\`
backend/src/middleware/network_context.rs
\`\`\`

### Existing Files
\`\`\`
backend/src/main.rs
backend/Cargo.toml
\`\`\`

## Description
Create middleware that extracts and validates the \`X-Stellar-Network\` header from incoming requests. This middleware will inject network context into the request state for downstream handlers.

## Acceptance Criteria
- [ ] Middleware extracts \`X-Stellar-Network\` header
- [ ] Validates network value (testnet/mainnet)
- [ ] Returns 400 for invalid network values
- [ ] Injects NetworkContext into request extensions
- [ ] Logs network context with request ID
- [ ] Defaults to testnet if header missing (dev mode only)

## Technical Details
- Use Axum middleware pattern
- Create NetworkContext struct with network enum
- Add proper error handling
- Include unit tests

## Dependencies
None

## Estimated Effort
3-5 hours`,
    labels: ['backend', 'phase-1', 'priority:high', 'enhancement']
  },
  {
    title: '[Backend] Separate Database Schemas for Testnet/Mainnet',
    body: `## Project Context
Phase 1: Backend Refactoring - Database architecture to support multi-network operations without data contamination.

## Task Type
- [x] Backend
- [x] Refactor
- [x] Enhancement

## Action Required
- [x] Create New File(s)
- [x] Update Existing File(s)

## File Locations Involved

### Existing Files
\`\`\`
backend/src/database.rs
backend/migrations/
\`\`\`

## Description
Implement separate SQLite database files for testnet and mainnet data. Update connection pooling to support network-specific databases.

## Acceptance Criteria
- [ ] Create testnet.db and mainnet.db files
- [ ] Update DatabasePool to support network parameter
- [ ] Implement connection pool per network
- [ ] Add migration scripts for both networks
- [ ] Prevent cross-network queries
- [ ] Add database metrics per network

## Technical Details
- Use SQLx connection pooling
- Implement NetworkDatabase wrapper
- Add database path configuration
- Include integration tests

## Dependencies
- Issue #1 (Network Context Middleware)

## Estimated Effort
8-12 hours`,
    labels: ['backend', 'phase-1', 'priority:high', 'refactor']
  },
  {
    title: '[Backend] Network-Aware RPC Client',
    body: `## Project Context
Phase 1: Backend Refactoring - Enable RPC client to route requests to correct Stellar network based on context.

## Task Type
- [x] Backend
- [x] Feature

## Action Required
- [x] Create New File(s)
- [x] Update Existing File(s)

## File Locations Involved

### New Files
\`\`\`
backend/src/rpc/network_router.rs
\`\`\`

### Existing Files
\`\`\`
backend/src/rpc/client.rs
backend/src/config.rs
\`\`\`

## Description
Create network-aware RPC client that routes Horizon/Soroban RPC calls to testnet or mainnet based on request context.

## Acceptance Criteria
- [ ] RPC client accepts NetworkContext parameter
- [ ] Routes to correct Horizon URL (testnet/mainnet)
- [ ] Routes to correct Soroban RPC URL
- [ ] Maintains separate connection pools per network
- [ ] Implements proper error handling
- [ ] Adds network label to RPC metrics

## Technical Details
- Use reqwest for HTTP client
- Implement connection pooling
- Add retry logic with exponential backoff
- Include circuit breaker pattern

## Dependencies
- Issue #1 (Network Context Middleware)

## Estimated Effort
6-8 hours`,
    labels: ['backend', 'phase-1', 'priority:high', 'feature']
  },
  {
    title: '[Backend] Mobile-Optimized Pagination Endpoints',
    body: `## Project Context
Phase 1: Backend Refactoring - Create cursor-based pagination for mobile clients to reduce payload size and improve performance.

## Task Type
- [x] Backend
- [x] Feature
- [x] Performance

## Action Required
- [x] Update Existing File(s)

## File Locations Involved

### Existing Files
\`\`\`
backend/src/handlers/corridors.rs
backend/src/handlers/anchors.rs
backend/src/handlers/assets.rs
\`\`\`

## Description
Implement cursor-based pagination for all list endpoints. Add support for page size limits and cursor tokens.

## Acceptance Criteria
- [ ] Add cursor parameter to list endpoints
- [ ] Implement page_size parameter (max 100)
- [ ] Return next_cursor in response
- [ ] Return has_more boolean flag
- [ ] Add pagination to corridors endpoint
- [ ] Add pagination to anchors endpoint
- [ ] Add pagination to assets endpoint
- [ ] Include pagination metadata in response

## Technical Details
- Use base64-encoded cursor tokens
- Implement efficient SQL queries with LIMIT/OFFSET
- Add cursor validation
- Include API documentation

## Dependencies
None

## Estimated Effort
5-7 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'performance']
  },
  {
    title: '[Backend] Field Selection Query Parameter',
    body: `## Project Context
Phase 1: Backend Refactoring - Allow mobile clients to request specific fields to reduce payload size.

## Task Type
- [x] Backend
- [x] Feature
- [x] Performance

## Action Required
- [x] Create New File(s)
- [x] Update Existing File(s)

## File Locations Involved

### New Files
\`\`\`
backend/src/middleware/field_selector.rs
\`\`\`

### Existing Files
\`\`\`
backend/src/handlers/corridors.rs
backend/src/handlers/anchors.rs
\`\`\`

## Description
Implement field selection via \`fields\` query parameter (e.g., \`?fields=id,name,status\`).

## Acceptance Criteria
- [ ] Parse fields query parameter
- [ ] Validate requested fields against schema
- [ ] Filter response to include only requested fields
- [ ] Return 400 for invalid field names
- [ ] Support nested field selection
- [ ] Add documentation for field selection

## Technical Details
- Use serde for dynamic serialization
- Implement field validation
- Add caching for field masks
- Include unit tests

## Dependencies
None

## Estimated Effort
4-6 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'feature']
  }
];

// Add more issues
const phase1Issues = [
  {
    title: '[Backend] Response Compression Middleware',
    body: `## Project Context
Phase 1: Backend Refactoring - Add gzip/brotli compression for API responses to reduce bandwidth usage for mobile clients.

## Task Type
- [x] Backend
- [x] Performance

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
backend/src/main.rs
backend/Cargo.toml
\`\`\`

## Description
Implement response compression middleware supporting gzip and brotli based on Accept-Encoding header.

## Acceptance Criteria
- [ ] Support gzip compression
- [ ] Support brotli compression
- [ ] Respect Accept-Encoding header
- [ ] Skip compression for small responses (<1KB)
- [ ] Add compression metrics
- [ ] Configure compression level

## Dependencies
None

## Estimated Effort
3-4 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'performance']
  },
  {
    title: '[Backend] ETag Support for Caching',
    body: `## Project Context
Phase 1: Backend Refactoring - Implement ETag headers for efficient HTTP caching.

## Task Type
- [x] Backend
- [x] Performance
- [x] Feature

## Action Required
- [x] Create New File(s)
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
backend/src/middleware/etag.rs
backend/src/handlers/corridors.rs
\`\`\`

## Description
Generate ETags for cacheable responses and handle If-None-Match headers to return 304 Not Modified.

## Acceptance Criteria
- [ ] Generate ETags for GET responses
- [ ] Handle If-None-Match header
- [ ] Return 304 when ETag matches
- [ ] Add Cache-Control headers
- [ ] Support weak ETags
- [ ] Add ETag to response headers

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'feature']
  },
  {
    title: '[Backend] Batch Endpoints for Mobile',
    body: `## Project Context
Phase 1: Backend Refactoring - Create batch endpoints to reduce round trips for mobile clients.

## Task Type
- [x] Backend
- [x] Feature
- [x] Performance

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
backend/src/handlers/batch.rs
\`\`\`

## Description
Implement batch endpoint that accepts multiple requests and returns multiple responses in a single HTTP call.

## Acceptance Criteria
- [ ] Accept array of request objects
- [ ] Execute requests in parallel
- [ ] Return array of responses
- [ ] Handle partial failures gracefully
- [ ] Limit batch size to 10 requests
- [ ] Add batch metrics

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['backend', 'phase-1', 'priority:low', 'feature']
  },
  {
    title: '[Backend] Network Status Endpoint',
    body: `## Project Context
Phase 1: Backend Refactoring - Create endpoint to expose current network configuration and health.

## Task Type
- [x] Backend
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
backend/src/handlers/network_status.rs
\`\`\`

## Description
Implement \`/api/v1/network/status\` endpoint that returns network configuration, RPC health, and database status.

## Acceptance Criteria
- [ ] Return current network (testnet/mainnet)
- [ ] Return Horizon RPC status
- [ ] Return Soroban RPC status
- [ ] Return database connection status
- [ ] Include last successful sync time
- [ ] Add response time metrics

## Dependencies
- Issue #3 (Network-Aware RPC Client)

## Estimated Effort
3-4 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'feature']
  },
  {
    title: '[Backend] Rate Limiting Per Client Type',
    body: `## Project Context
Phase 1: Backend Refactoring - Implement different rate limits for web vs mobile clients.

## Task Type
- [x] Backend
- [x] Security
- [x] Feature

## Action Required
- [x] Create New File(s)
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
backend/src/middleware/rate_limit.rs
backend/src/main.rs
\`\`\`

## Description
Create rate limiting middleware that applies different limits based on client type (web/mobile) detected from User-Agent header.

## Acceptance Criteria
- [ ] Detect client type from User-Agent
- [ ] Apply 100 req/min for web clients
- [ ] Apply 60 req/min for mobile clients
- [ ] Return 429 with Retry-After header
- [ ] Add rate limit headers to responses
- [ ] Store rate limit state in Redis

## Dependencies
None

## Estimated Effort
5-6 hours`,
    labels: ['backend', 'phase-1', 'priority:high', 'security']
  }
];

console.log('Creating GitHub issues...\n');

[...issues, ...phase1Issues].forEach((issue, index) => {
  try {
    const cmd = `gh issue create --title "${issue.title.replace(/"/g, '\\"')}" --body "${issue.body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" --label "${issue.labels.join(',')}"`;
    
    console.log(`Creating issue ${index + 1}: ${issue.title}`);
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✓ Created issue ${index + 1}\n`);
  } catch (error) {
    console.error(`✗ Failed to create issue ${index + 1}: ${error.message}\n`);
  }
});

console.log('Done!');

// PHASE 1 CONTINUED (10 more issues)
const phase1MoreIssues = [
  {
    title: '[Backend] JWT Token Refresh Endpoint',
    body: `## Project Context
Phase 1: Backend Refactoring - Implement token refresh mechanism for mobile clients.

## Task Type
- [x] Backend
- [x] Security
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
backend/src/handlers/auth.rs
backend/src/auth/jwt.rs
\`\`\`

## Description
Create \`/api/v1/auth/refresh\` endpoint that accepts refresh tokens and returns new access tokens.

## Acceptance Criteria
- [ ] Accept refresh token in request body
- [ ] Validate refresh token signature
- [ ] Check token expiration
- [ ] Generate new access token
- [ ] Rotate refresh token
- [ ] Invalidate old refresh token
- [ ] Return new token pair

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['backend', 'phase-1', 'priority:high', 'security']
  },
  {
    title: '[Backend] SEP-10 Authentication for Mobile',
    body: `## Project Context
Phase 1: Backend Refactoring - Adapt SEP-10 Stellar authentication for mobile clients.

## Task Type
- [x] Backend
- [x] Security
- [x] Feature

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
backend/src/auth/sep10.rs
backend/src/handlers/auth.rs
\`\`\`

## Description
Update SEP-10 authentication flow to work seamlessly with mobile clients, including deep linking support.

## Acceptance Criteria
- [ ] Support mobile deep link callbacks
- [ ] Generate mobile-friendly challenge transactions
- [ ] Handle mobile wallet signatures
- [ ] Return JWT tokens after verification
- [ ] Add device fingerprinting
- [ ] Support biometric authentication flow

## Dependencies
- Issue #11 (JWT Token Refresh)

## Estimated Effort
6-8 hours`,
    labels: ['backend', 'phase-1', 'priority:high', 'security']
  },
  {
    title: '[Backend] Push Notification Registration Endpoint',
    body: `## Project Context
Phase 1: Backend Refactoring - Create endpoint for mobile clients to register FCM/APNS tokens.

## Task Type
- [x] Backend
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
backend/src/handlers/notifications.rs
backend/src/models/device.rs
\`\`\`

## Description
Implement endpoint to register and manage push notification tokens for mobile devices.

## Acceptance Criteria
- [ ] Accept FCM token (Android)
- [ ] Accept APNS token (iOS)
- [ ] Store token with user association
- [ ] Support token updates
- [ ] Handle token expiration
- [ ] Allow token deletion
- [ ] Validate token format

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'feature']
  },
  {
    title: '[Backend] Push Notification Service Integration',
    body: `## Project Context
Phase 1: Backend Refactoring - Integrate with FCM and APNS for sending push notifications.

## Task Type
- [x] Backend
- [x] Feature
- [x] DevOps

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
backend/src/services/push_notifications.rs
backend/Cargo.toml
\`\`\`

## Description
Create service to send push notifications via Firebase Cloud Messaging and Apple Push Notification Service.

## Acceptance Criteria
- [ ] Integrate FCM SDK
- [ ] Integrate APNS SDK
- [ ] Send notifications to Android devices
- [ ] Send notifications to iOS devices
- [ ] Handle notification failures
- [ ] Implement retry logic
- [ ] Add notification metrics

## Dependencies
- Issue #13 (Push Notification Registration)

## Estimated Effort
8-10 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'feature']
  },
  {
    title: '[Backend] WebSocket Support for Real-Time Updates',
    body: `## Project Context
Phase 1: Backend Refactoring - Add WebSocket endpoint for real-time data sync to mobile clients.

## Task Type
- [x] Backend
- [x] Feature
- [x] Performance

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
backend/src/websocket/mod.rs
backend/src/websocket/handlers.rs
\`\`\`

## Description
Implement WebSocket endpoint for real-time updates on corridors, anchors, and analytics data.

## Acceptance Criteria
- [ ] Create WebSocket endpoint at /ws
- [ ] Authenticate WebSocket connections
- [ ] Broadcast corridor updates
- [ ] Broadcast anchor status changes
- [ ] Support subscription filtering
- [ ] Handle connection lifecycle
- [ ] Add WebSocket metrics

## Dependencies
None

## Estimated Effort
10-12 hours`,
    labels: ['backend', 'phase-1', 'priority:low', 'feature']
  },
  {
    title: '[Backend] API Versioning Infrastructure',
    body: `## Project Context
Phase 1: Backend Refactoring - Implement API versioning to support multiple client versions.

## Task Type
- [x] Backend
- [x] Refactor
- [x] Feature

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
backend/src/main.rs
backend/src/routes/mod.rs
\`\`\`

## Description
Implement URL-based API versioning (/api/v1/, /api/v2/) with version negotiation.

## Acceptance Criteria
- [ ] Support /api/v1/ prefix
- [ ] Prepare /api/v2/ structure
- [ ] Add version to request context
- [ ] Return API-Version header
- [ ] Add deprecation warnings
- [ ] Document version differences

## Dependencies
None

## Estimated Effort
5-6 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'refactor']
  },
  {
    title: '[Backend] API Deprecation Warning System',
    body: `## Project Context
Phase 1: Backend Refactoring - Create system to warn clients about deprecated endpoints.

## Task Type
- [x] Backend
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
backend/src/middleware/deprecation.rs
\`\`\`

## Description
Implement middleware that adds deprecation warnings to response headers for deprecated endpoints.

## Acceptance Criteria
- [ ] Add Deprecation header to responses
- [ ] Add Sunset header with removal date
- [ ] Add Link header to replacement endpoint
- [ ] Log deprecation usage
- [ ] Track deprecation metrics
- [ ] Document deprecation policy

## Dependencies
- Issue #16 (API Versioning)

## Estimated Effort
3-4 hours`,
    labels: ['backend', 'phase-1', 'priority:low', 'feature']
  },
  {
    title: '[Backend] Request/Response Logging for Mobile',
    body: `## Project Context
Phase 1: Backend Refactoring - Enhanced logging for mobile client debugging.

## Task Type
- [x] Backend
- [x] DevOps
- [x] Enhancement

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
backend/src/middleware/logging.rs
\`\`\`

## Description
Enhance request/response logging to include mobile-specific metadata (device type, OS version, app version).

## Acceptance Criteria
- [ ] Log User-Agent details
- [ ] Log X-App-Version header
- [ ] Log X-Device-ID header
- [ ] Log network context
- [ ] Log response time
- [ ] Add structured logging
- [ ] Include correlation IDs

## Dependencies
None

## Estimated Effort
3-4 hours`,
    labels: ['backend', 'phase-1', 'priority:low', 'enhancement']
  },
  {
    title: '[Backend] Health Check Endpoint Enhancement',
    body: `## Project Context
Phase 1: Backend Refactoring - Enhance health check endpoint with detailed component status.

## Task Type
- [x] Backend
- [x] DevOps
- [x] Enhancement

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
backend/src/handlers/health.rs
\`\`\`

## Description
Enhance /health endpoint to return detailed status of all backend components.

## Acceptance Criteria
- [ ] Check database connectivity (both networks)
- [ ] Check RPC connectivity (both networks)
- [ ] Check Redis connectivity
- [ ] Return component-level status
- [ ] Add response time for each check
- [ ] Support ?detailed=true parameter
- [ ] Return 503 if any critical component fails

## Dependencies
None

## Estimated Effort
3-4 hours`,
    labels: ['backend', 'phase-1', 'priority:medium', 'devops']
  },
  {
    title: '[Backend] Configuration Management for Multi-Network',
    body: `## Project Context
Phase 1: Backend Refactoring - Centralize configuration for testnet/mainnet environments.

## Task Type
- [x] Backend
- [x] Refactor
- [x] DevOps

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
backend/src/config.rs
backend/.env.example
\`\`\`

## Description
Refactor configuration to support network-specific settings (RPC URLs, database paths, contract addresses).

## Acceptance Criteria
- [ ] Add testnet RPC configuration
- [ ] Add mainnet RPC configuration
- [ ] Add network-specific database paths
- [ ] Add network-specific contract addresses
- [ ] Validate configuration on startup
- [ ] Support environment variable overrides
- [ ] Document all configuration options

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['backend', 'phase-1', 'priority:high', 'refactor']
  }
];

// PHASE 2: SHARED SDK (15 issues)
const phase2Issues = [
  {
    title: '[SDK] Initialize TypeScript SDK Package',
    body: `## Project Context
Phase 2: Shared SDK Development - Create foundation for shared TypeScript SDK used by web and mobile clients.

## Task Type
- [x] Feature
- [x] Enhancement

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/package.json
sdk/tsconfig.json
sdk/src/index.ts
\`\`\`

## Description
Initialize new TypeScript package for the Stellar Insights SDK with proper build configuration.

## Acceptance Criteria
- [ ] Create package.json with dependencies
- [ ] Configure TypeScript compilation
- [ ] Set up ESM and CJS builds
- [ ] Configure Jest for testing
- [ ] Add ESLint and Prettier
- [ ] Create README with usage examples
- [ ] Set up CI/CD for publishing

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'feature']
  },
  {
    title: '[SDK] API Client Core Implementation',
    body: `## Project Context
Phase 2: Shared SDK Development - Core HTTP client with authentication and error handling.

## Task Type
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/client/ApiClient.ts
sdk/src/client/types.ts
\`\`\`

## Description
Implement core API client class with request/response handling, authentication, and error management.

## Acceptance Criteria
- [ ] Create ApiClient class
- [ ] Support GET, POST, PUT, DELETE methods
- [ ] Add authentication token management
- [ ] Implement request interceptors
- [ ] Implement response interceptors
- [ ] Handle network errors gracefully
- [ ] Add TypeScript types for all methods

## Dependencies
- Issue #21 (Initialize SDK Package)

## Estimated Effort
6-8 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'feature']
  },
  {
    title: '[SDK] Network Context Management',
    body: `## Project Context
Phase 2: Shared SDK Development - SDK support for network switching between testnet and mainnet.

## Task Type
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/network/NetworkManager.ts
sdk/src/network/types.ts
\`\`\`

## Description
Implement network context management that automatically adds X-Stellar-Network header to requests.

## Acceptance Criteria
- [ ] Create NetworkManager class
- [ ] Support setNetwork(network) method
- [ ] Add network to all API requests
- [ ] Emit network change events
- [ ] Clear cache on network switch
- [ ] Validate network values
- [ ] Add TypeScript types

## Dependencies
- Issue #22 (API Client Core)

## Estimated Effort
4-5 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'feature']
  },
  {
    title: '[SDK] Authentication Module',
    body: `## Project Context
Phase 2: Shared SDK Development - Authentication handling with token management and refresh logic.

## Task Type
- [x] Feature
- [x] Security

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/auth/AuthManager.ts
sdk/src/auth/TokenStorage.ts
\`\`\`

## Description
Implement authentication module with token storage, refresh logic, and SEP-10 support.

## Acceptance Criteria
- [ ] Create AuthManager class
- [ ] Implement token storage (browser/mobile)
- [ ] Add automatic token refresh
- [ ] Support SEP-10 authentication
- [ ] Handle authentication errors
- [ ] Emit authentication events
- [ ] Add TypeScript types

## Dependencies
- Issue #22 (API Client Core)

## Estimated Effort
8-10 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'security']
  },
  {
    title: '[SDK] Retry Logic with Exponential Backoff',
    body: `## Project Context
Phase 2: Shared SDK Development - Implement automatic retry for failed requests with exponential backoff.

## Task Type
- [x] Feature
- [x] Performance

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/client/RetryManager.ts
\`\`\`

## Description
Create retry mechanism for failed API requests with configurable backoff strategy.

## Acceptance Criteria
- [ ] Implement exponential backoff
- [ ] Support max retry attempts (default: 3)
- [ ] Retry on network errors
- [ ] Retry on 5xx errors
- [ ] Don't retry on 4xx errors
- [ ] Add jitter to prevent thundering herd
- [ ] Make retry configurable

## Dependencies
- Issue #22 (API Client Core)

## Estimated Effort
4-5 hours`,
    labels: ['sdk', 'phase-2', 'priority:medium', 'feature']
  },
  {
    title: '[SDK] Request Deduplication',
    body: `## Project Context
Phase 2: Shared SDK Development - Prevent duplicate simultaneous requests to the same endpoint.

## Task Type
- [x] Feature
- [x] Performance

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/client/RequestDeduplicator.ts
\`\`\`

## Description
Implement request deduplication to prevent multiple identical requests from being sent simultaneously.

## Acceptance Criteria
- [ ] Track in-flight requests
- [ ] Return same promise for duplicate requests
- [ ] Use request URL + params as key
- [ ] Clear cache after request completes
- [ ] Support opt-out per request
- [ ] Add metrics for deduplication hits

## Dependencies
- Issue #22 (API Client Core)

## Estimated Effort
3-4 hours`,
    labels: ['sdk', 'phase-2', 'priority:low', 'performance']
  },
  {
    title: '[SDK] Request Cancellation Support',
    body: `## Project Context
Phase 2: Shared SDK Development - Allow clients to cancel in-flight requests.

## Task Type
- [x] Feature

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
sdk/src/client/ApiClient.ts
\`\`\`

## Description
Add support for canceling in-flight requests using AbortController.

## Acceptance Criteria
- [ ] Support AbortSignal in request options
- [ ] Cancel request when signal aborts
- [ ] Clean up resources on cancellation
- [ ] Return cancellation error
- [ ] Add cancelAll() method
- [ ] Document cancellation usage

## Dependencies
- Issue #22 (API Client Core)

## Estimated Effort
3-4 hours`,
    labels: ['sdk', 'phase-2', 'priority:medium', 'feature']
  },
  {
    title: '[SDK] TypeScript Type Definitions',
    body: `## Project Context
Phase 2: Shared SDK Development - Comprehensive TypeScript types for all API responses and requests.

## Task Type
- [x] Feature
- [x] Documentation

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/types/api.ts
sdk/src/types/models.ts
sdk/src/types/responses.ts
\`\`\`

## Description
Create complete TypeScript type definitions for all API endpoints, models, and responses.

## Acceptance Criteria
- [ ] Define types for all API responses
- [ ] Define types for all request payloads
- [ ] Define types for domain models
- [ ] Export all types from index
- [ ] Add JSDoc comments
- [ ] Include examples in comments
- [ ] Ensure strict type checking

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'documentation']
  },
  {
    title: '[SDK] Corridors API Module',
    body: `## Project Context
Phase 2: Shared SDK Development - SDK module for corridors API endpoints.

## Task Type
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/api/corridors.ts
\`\`\`

## Description
Implement SDK module for corridors API with methods for listing, getting details, and analytics.

## Acceptance Criteria
- [ ] Implement listCorridors() method
- [ ] Implement getCorridor(id) method
- [ ] Implement getCorridorAnalytics(id) method
- [ ] Support pagination parameters
- [ ] Support field selection
- [ ] Add TypeScript types
- [ ] Include JSDoc documentation

## Dependencies
- Issue #22 (API Client Core)
- Issue #28 (Type Definitions)

## Estimated Effort
4-5 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'feature']
  },
  {
    title: '[SDK] Anchors API Module',
    body: `## Project Context
Phase 2: Shared SDK Development - SDK module for anchors API endpoints.

## Task Type
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/api/anchors.ts
\`\`\`

## Description
Implement SDK module for anchors API with methods for listing, getting details, and status.

## Acceptance Criteria
- [ ] Implement listAnchors() method
- [ ] Implement getAnchor(id) method
- [ ] Implement getAnchorStatus(id) method
- [ ] Support pagination parameters
- [ ] Support filtering by status
- [ ] Add TypeScript types
- [ ] Include JSDoc documentation

## Dependencies
- Issue #22 (API Client Core)
- Issue #28 (Type Definitions)

## Estimated Effort
4-5 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'feature']
  }
];

const phase2MoreIssues = [
  {
    title: '[SDK] Assets API Module',
    body: `## Project Context
Phase 2: Shared SDK Development - SDK module for assets API endpoints.

## Task Type
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/api/assets.ts
\`\`\`

## Description
Implement SDK module for assets API with methods for listing and verification status.

## Acceptance Criteria
- [ ] Implement listAssets() method
- [ ] Implement getAsset(code, issuer) method
- [ ] Implement verifyAsset(code, issuer) method
- [ ] Support pagination parameters
- [ ] Support filtering by verified status
- [ ] Add TypeScript types
- [ ] Include JSDoc documentation

## Dependencies
- Issue #22 (API Client Core)
- Issue #28 (Type Definitions)

## Estimated Effort
3-4 hours`,
    labels: ['sdk', 'phase-2', 'priority:medium', 'feature']
  },
  {
    title: '[SDK] Analytics API Module',
    body: `## Project Context
Phase 2: Shared SDK Development - SDK module for analytics API endpoints.

## Task Type
- [x] Feature

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/api/analytics.ts
\`\`\`

## Description
Implement SDK module for analytics API with methods for dashboard metrics and time-series data.

## Acceptance Criteria
- [ ] Implement getDashboardMetrics() method
- [ ] Implement getVolumeTimeSeries() method
- [ ] Implement getSuccessRateTimeSeries() method
- [ ] Support date range parameters
- [ ] Support granularity parameter
- [ ] Add TypeScript types
- [ ] Include JSDoc documentation

## Dependencies
- Issue #22 (API Client Core)
- Issue #28 (Type Definitions)

## Estimated Effort
4-5 hours`,
    labels: ['sdk', 'phase-2', 'priority:medium', 'feature']
  },
  {
    title: '[SDK] React Native Compatibility',
    body: `## Project Context
Phase 2: Shared SDK Development - Ensure SDK works in React Native environment.

## Task Type
- [x] Feature
- [x] Testing

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
sdk/src/client/ApiClient.ts
sdk/src/auth/TokenStorage.ts
sdk/package.json
\`\`\`

## Description
Ensure SDK is compatible with React Native by using platform-agnostic APIs and testing in RN environment.

## Acceptance Criteria
- [ ] Use fetch API (not Node-specific)
- [ ] Support React Native AsyncStorage
- [ ] Test in React Native environment
- [ ] Handle React Native network errors
- [ ] Support React Native debugging
- [ ] Document React Native setup
- [ ] Add React Native example

## Dependencies
- Issue #22 (API Client Core)
- Issue #24 (Authentication Module)

## Estimated Effort
6-8 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'feature']
  },
  {
    title: '[SDK] Unit Tests for Core Modules',
    body: `## Project Context
Phase 2: Shared SDK Development - Comprehensive unit tests for SDK core functionality.

## Task Type
- [x] Testing

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/src/__tests__/ApiClient.test.ts
sdk/src/__tests__/AuthManager.test.ts
sdk/src/__tests__/NetworkManager.test.ts
\`\`\`

## Description
Write comprehensive unit tests for all SDK core modules with high code coverage.

## Acceptance Criteria
- [ ] Test ApiClient methods
- [ ] Test AuthManager methods
- [ ] Test NetworkManager methods
- [ ] Test error handling
- [ ] Test retry logic
- [ ] Achieve >80% code coverage
- [ ] Mock external dependencies

## Dependencies
- Issue #22 (API Client Core)
- Issue #23 (Network Context)
- Issue #24 (Authentication Module)

## Estimated Effort
8-10 hours`,
    labels: ['sdk', 'phase-2', 'priority:high', 'testing']
  },
  {
    title: '[SDK] NPM Package Publishing Setup',
    body: `## Project Context
Phase 2: Shared SDK Development - Configure automated NPM publishing with CI/CD.

## Task Type
- [x] DevOps
- [x] Enhancement

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
sdk/.github/workflows/publish.yml
sdk/.npmignore
\`\`\`

## Description
Set up automated NPM package publishing with version management and release notes.

## Acceptance Criteria
- [ ] Configure GitHub Actions for publishing
- [ ] Set up NPM authentication
- [ ] Automate version bumping
- [ ] Generate changelog automatically
- [ ] Publish on tag creation
- [ ] Test package before publishing
- [ ] Document release process

## Dependencies
- Issue #21 (Initialize SDK Package)

## Estimated Effort
4-5 hours`,
    labels: ['sdk', 'phase-2', 'priority:medium', 'devops']
  }
];

// PHASE 3: MOBILE APP (30 issues)
const phase3Issues = [
  {
    title: '[Mobile] iOS Project Setup with React Native',
    body: `## Project Context
Phase 3: Mobile App MVP - Initialize iOS project with proper configuration and dependencies.

## Task Type
- [x] Feature
- [x] DevOps

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/ios/Podfile
mobile/ios/StellarInsights/Info.plist
\`\`\`

## Description
Set up iOS project with CocoaPods, configure app permissions, and set up signing.

## Acceptance Criteria
- [ ] Initialize iOS project
- [ ] Configure Podfile with dependencies
- [ ] Set up app permissions (camera, biometrics)
- [ ] Configure app icons and splash screen
- [ ] Set up code signing
- [ ] Configure build schemes
- [ ] Test iOS build

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'ios']
  },
  {
    title: '[Mobile] Android Project Setup with React Native',
    body: `## Project Context
Phase 3: Mobile App MVP - Initialize Android project with proper configuration and dependencies.

## Task Type
- [x] Feature
- [x] DevOps

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/android/app/build.gradle
mobile/android/app/src/main/AndroidManifest.xml
\`\`\`

## Description
Set up Android project with Gradle configuration, permissions, and signing.

## Acceptance Criteria
- [ ] Configure build.gradle
- [ ] Set up app permissions
- [ ] Configure app icons and splash screen
- [ ] Set up ProGuard rules
- [ ] Configure signing configs
- [ ] Set up build variants
- [ ] Test Android build

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'android']
  },
  {
    title: '[Mobile] Implement Splash Screen',
    body: `## Project Context
Phase 3: Mobile App MVP - Create branded splash screen for app launch.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/SplashScreen.tsx
mobile/ios/StellarInsights/LaunchScreen.storyboard
mobile/android/app/src/main/res/drawable/launch_screen.xml
\`\`\`

## Description
Implement splash screen that displays while app initializes and loads authentication state.

## Acceptance Criteria
- [ ] Create splash screen component
- [ ] Add Stellar Insights branding
- [ ] Show loading indicator
- [ ] Handle initialization errors
- [ ] Transition to auth or main screen
- [ ] Match iOS/Android guidelines
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'ui/ux']
  },
  {
    title: '[Mobile] Biometric Authentication Implementation',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement Face ID/Touch ID/Fingerprint authentication.

## Task Type
- [x] Feature
- [x] Security

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/services/biometrics.ts
mobile/src/hooks/useBiometrics.ts
\`\`\`

## Description
Implement biometric authentication using react-native-biometrics for secure app access.

## Acceptance Criteria
- [ ] Check biometric availability
- [ ] Request biometric permission
- [ ] Implement Face ID (iOS)
- [ ] Implement Touch ID (iOS)
- [ ] Implement Fingerprint (Android)
- [ ] Store biometric preference
- [ ] Add fallback to PIN
- [ ] Handle biometric errors

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'security']
  },
  {
    title: '[Mobile] Secure Token Storage with Keychain',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement secure storage for authentication tokens using platform keychain.

## Task Type
- [x] Feature
- [x] Security

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/services/auth.ts
mobile/src/services/storage.ts
\`\`\`

## Description
Use react-native-keychain to securely store JWT tokens in iOS Keychain and Android Keystore.

## Acceptance Criteria
- [ ] Store tokens in keychain
- [ ] Retrieve tokens from keychain
- [ ] Delete tokens on logout
- [ ] Handle keychain errors
- [ ] Support biometric protection
- [ ] Test on both platforms
- [ ] Add error recovery

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'security']
  },
  {
    title: '[Mobile] Login Screen with Wallet Connect',
    body: `## Project Context
Phase 3: Mobile App MVP - Create login screen with Stellar wallet connection.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/auth/LoginScreen.tsx
\`\`\`

## Description
Implement login screen with wallet connection button and SEP-10 authentication flow.

## Acceptance Criteria
- [ ] Create login UI
- [ ] Add wallet connect button
- [ ] Implement SEP-10 flow
- [ ] Handle deep linking
- [ ] Show loading states
- [ ] Handle authentication errors
- [ ] Add error messages
- [ ] Test wallet integration

## Dependencies
- Issue #40 (Secure Token Storage)

## Estimated Effort
8-10 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'feature']
  },
  {
    title: '[Mobile] Dashboard Screen Implementation',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement main dashboard with key metrics and charts.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/DashboardScreen.tsx
mobile/src/components/MetricCard.tsx
\`\`\`

## Description
Build dashboard screen showing total volume, active corridors, success rate, and recent activity.

## Acceptance Criteria
- [ ] Display key metrics cards
- [ ] Show volume chart
- [ ] Show success rate trend
- [ ] Add pull-to-refresh
- [ ] Handle loading states
- [ ] Handle empty states
- [ ] Handle error states
- [ ] Add skeleton loaders

## Dependencies
None

## Estimated Effort
10-12 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'feature']
  },
  {
    title: '[Mobile] Corridors List Screen',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement corridors list with search and filtering.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/CorridorsScreen.tsx
mobile/src/components/CorridorCard.tsx
\`\`\`

## Description
Build corridors list screen with infinite scroll, search, and filtering capabilities.

## Acceptance Criteria
- [ ] Display corridors list
- [ ] Implement infinite scroll
- [ ] Add search functionality
- [ ] Add filter by asset
- [ ] Show corridor metrics
- [ ] Add pull-to-refresh
- [ ] Handle loading states
- [ ] Handle empty states

## Dependencies
None

## Estimated Effort
8-10 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'feature']
  },
  {
    title: '[Mobile] Corridor Detail Screen',
    body: `## Project Context
Phase 3: Mobile App MVP - Detailed view of individual corridor with analytics.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/CorridorDetailScreen.tsx
\`\`\`

## Description
Create detailed corridor view showing analytics, volume trends, and anchor information.

## Acceptance Criteria
- [ ] Display corridor details
- [ ] Show volume chart
- [ ] Show success rate chart
- [ ] Display anchor information
- [ ] Add share functionality
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Add navigation from list

## Dependencies
- Issue #43 (Corridors List Screen)

## Estimated Effort
8-10 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'feature']
  },
  {
    title: '[Mobile] Anchors List Screen',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement anchors list with status indicators.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/AnchorsScreen.tsx
mobile/src/components/AnchorCard.tsx
\`\`\`

## Description
Build anchors list screen showing anchor status, uptime, and supported assets.

## Acceptance Criteria
- [ ] Display anchors list
- [ ] Show status indicators
- [ ] Display uptime percentage
- [ ] Show supported assets
- [ ] Add search functionality
- [ ] Add pull-to-refresh
- [ ] Handle loading states
- [ ] Handle empty states

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'feature']
  }
];

const phase3MoreIssues = [
  {
    title: '[Mobile] Anchor Detail Screen',
    body: `## Project Context
Phase 3: Mobile App MVP - Detailed view of individual anchor with metrics and assets.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/AnchorDetailScreen.tsx
\`\`\`

## Description
Create detailed anchor view showing status history, supported assets, and performance metrics.

## Acceptance Criteria
- [ ] Display anchor details
- [ ] Show status history
- [ ] List supported assets
- [ ] Display uptime chart
- [ ] Show domain information
- [ ] Add share functionality
- [ ] Handle loading states
- [ ] Add navigation from list

## Dependencies
- Issue #45 (Anchors List Screen)

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'feature']
  },
  {
    title: '[Mobile] Settings Screen with Network Switcher',
    body: `## Project Context
Phase 3: Mobile App MVP - Settings screen with network switching and preferences.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/SettingsScreen.tsx
\`\`\`

## Description
Build settings screen with network switcher, theme toggle, and account management.

## Acceptance Criteria
- [ ] Add network switcher (testnet/mainnet)
- [ ] Add theme toggle (light/dark)
- [ ] Show account information
- [ ] Add biometric settings
- [ ] Add notification preferences
- [ ] Add logout button
- [ ] Show app version
- [ ] Confirm network switch

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'feature']
  },
  {
    title: '[Mobile] Network Switch Confirmation Dialog',
    body: `## Project Context
Phase 3: Mobile App MVP - Confirmation dialog when switching between testnet and mainnet.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/components/NetworkSwitchDialog.tsx
\`\`\`

## Description
Create confirmation dialog that warns users about cache clearing when switching networks.

## Acceptance Criteria
- [ ] Show warning message
- [ ] Explain cache will be cleared
- [ ] Add confirm/cancel buttons
- [ ] Clear cache on confirm
- [ ] Update network context
- [ ] Reload data after switch
- [ ] Handle switch errors
- [ ] Add loading indicator

## Dependencies
- Issue #47 (Settings Screen)

## Estimated Effort
3-4 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'ui/ux']
  },
  {
    title: '[Mobile] Offline Data Caching with MMKV',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement fast local caching for offline support.

## Task Type
- [x] Feature
- [x] Performance

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/services/storage.ts
mobile/src/services/cache.ts
\`\`\`

## Description
Implement MMKV-based caching for API responses to enable offline data access.

## Acceptance Criteria
- [ ] Cache API responses
- [ ] Set cache expiration times
- [ ] Implement cache invalidation
- [ ] Clear cache on network switch
- [ ] Add cache size limits
- [ ] Show staleness indicators
- [ ] Handle cache errors
- [ ] Add cache metrics

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'performance']
  },
  {
    title: '[Mobile] Offline Queue for Mutations',
    body: `## Project Context
Phase 3: Mobile App MVP - Queue write operations when offline and sync when online.

## Task Type
- [x] Feature
- [x] Enhancement

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/services/offlineQueue.ts
\`\`\`

## Description
Implement offline queue that stores mutations and syncs them when connection is restored.

## Acceptance Criteria
- [ ] Queue mutations when offline
- [ ] Store queue in persistent storage
- [ ] Sync queue when online
- [ ] Handle sync failures
- [ ] Show sync status
- [ ] Add retry logic
- [ ] Clear queue on success
- [ ] Handle conflicts

## Dependencies
- Issue #49 (Offline Data Caching)

## Estimated Effort
8-10 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'feature']
  },
  {
    title: '[Mobile] Network Status Indicator',
    body: `## Project Context
Phase 3: Mobile App MVP - Visual indicator showing online/offline status and sync state.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/components/NetworkStatusBar.tsx
\`\`\`

## Description
Create status bar component that shows network connectivity and data sync status.

## Acceptance Criteria
- [ ] Show online/offline status
- [ ] Show syncing indicator
- [ ] Show current network (testnet/mainnet)
- [ ] Add tap to retry sync
- [ ] Auto-hide when online
- [ ] Show in all screens
- [ ] Use platform-specific styling
- [ ] Add animations

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'ui/ux']
  },
  {
    title: '[Mobile] Pull-to-Refresh Implementation',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement pull-to-refresh gesture for all list screens.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/DashboardScreen.tsx
mobile/src/screens/main/CorridorsScreen.tsx
mobile/src/screens/main/AnchorsScreen.tsx
\`\`\`

## Description
Add pull-to-refresh functionality to all list screens for manual data refresh.

## Acceptance Criteria
- [ ] Add to dashboard screen
- [ ] Add to corridors screen
- [ ] Add to anchors screen
- [ ] Show refresh indicator
- [ ] Trigger data refetch
- [ ] Handle refresh errors
- [ ] Add haptic feedback
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
3-4 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'ui/ux']
  },
  {
    title: '[Mobile] Infinite Scroll for Lists',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement infinite scroll with pagination for long lists.

## Task Type
- [x] Feature
- [x] Performance

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/CorridorsScreen.tsx
mobile/src/screens/main/AnchorsScreen.tsx
mobile/src/hooks/useInfiniteScroll.ts
\`\`\`

## Description
Implement infinite scroll that loads more items as user scrolls to bottom of list.

## Acceptance Criteria
- [ ] Load more on scroll to bottom
- [ ] Show loading indicator
- [ ] Handle end of list
- [ ] Prevent duplicate loads
- [ ] Add error handling
- [ ] Support pull-to-refresh
- [ ] Optimize performance
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
5-6 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'performance']
  },
  {
    title: '[Mobile] Search Functionality',
    body: `## Project Context
Phase 3: Mobile App MVP - Add search capability to corridors and anchors screens.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/components/SearchBar.tsx
mobile/src/hooks/useSearch.ts
\`\`\`

## Description
Implement search bar component with debounced search for corridors and anchors.

## Acceptance Criteria
- [ ] Create search bar component
- [ ] Implement debounced search
- [ ] Add search to corridors screen
- [ ] Add search to anchors screen
- [ ] Show search results
- [ ] Handle no results
- [ ] Add clear button
- [ ] Test performance

## Dependencies
None

## Estimated Effort
5-6 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'feature']
  },
  {
    title: '[Mobile] Push Notifications Setup',
    body: `## Project Context
Phase 3: Mobile App MVP - Configure Firebase Cloud Messaging for push notifications.

## Task Type
- [x] Feature
- [x] DevOps

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/ios/GoogleService-Info.plist
mobile/android/app/google-services.json
\`\`\`

## Description
Set up Firebase Cloud Messaging for iOS and Android push notifications.

## Acceptance Criteria
- [ ] Configure Firebase project
- [ ] Add iOS configuration
- [ ] Add Android configuration
- [ ] Request notification permissions
- [ ] Register device token
- [ ] Handle notification received
- [ ] Handle notification tapped
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'devops']
  },
  {
    title: '[Mobile] Notification Preferences Screen',
    body: `## Project Context
Phase 3: Mobile App MVP - Allow users to configure notification preferences.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/screens/main/NotificationSettingsScreen.tsx
\`\`\`

## Description
Create screen for users to enable/disable different types of notifications.

## Acceptance Criteria
- [ ] Toggle price alerts
- [ ] Toggle transaction notifications
- [ ] Toggle anchor status alerts
- [ ] Toggle system notifications
- [ ] Save preferences to backend
- [ ] Show current settings
- [ ] Handle permission denied
- [ ] Add navigation from settings

## Dependencies
- Issue #55 (Push Notifications Setup)

## Estimated Effort
4-5 hours`,
    labels: ['mobile', 'phase-3', 'priority:low', 'feature']
  },
  {
    title: '[Mobile] Local Notification for Sync Complete',
    body: `## Project Context
Phase 3: Mobile App MVP - Show local notification when offline data sync completes.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/services/offlineQueue.ts
mobile/src/services/notifications.ts
\`\`\`

## Description
Display local notification when offline queue sync completes successfully.

## Acceptance Criteria
- [ ] Show notification on sync complete
- [ ] Include number of synced items
- [ ] Handle sync failures
- [ ] Make notification tappable
- [ ] Navigate to relevant screen
- [ ] Respect notification settings
- [ ] Test on both platforms
- [ ] Add sound/vibration

## Dependencies
- Issue #50 (Offline Queue)
- Issue #55 (Push Notifications Setup)

## Estimated Effort
3-4 hours`,
    labels: ['mobile', 'phase-3', 'priority:low', 'feature']
  },
  {
    title: '[Mobile] Deep Linking Configuration',
    body: `## Project Context
Phase 3: Mobile App MVP - Configure deep linking for sharing and wallet callbacks.

## Task Type
- [x] Feature
- [x] DevOps

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/ios/StellarInsights/Info.plist
mobile/android/app/src/main/AndroidManifest.xml
mobile/src/navigation/linking.ts
\`\`\`

## Description
Set up deep linking to handle URLs like stellarinsights://corridor/123 and wallet callbacks.

## Acceptance Criteria
- [ ] Configure iOS URL schemes
- [ ] Configure Android intent filters
- [ ] Handle corridor deep links
- [ ] Handle anchor deep links
- [ ] Handle wallet callback links
- [ ] Parse URL parameters
- [ ] Navigate to correct screen
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
5-6 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'feature']
  },
  {
    title: '[Mobile] Share Functionality',
    body: `## Project Context
Phase 3: Mobile App MVP - Allow users to share corridors and anchors via native share sheet.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/utils/share.ts
\`\`\`

## Description
Implement native share functionality for corridors and anchors using React Native Share API.

## Acceptance Criteria
- [ ] Share corridor details
- [ ] Share anchor details
- [ ] Include deep link URL
- [ ] Add share button to detail screens
- [ ] Handle share errors
- [ ] Support image sharing
- [ ] Test on both platforms
- [ ] Add analytics tracking

## Dependencies
- Issue #58 (Deep Linking)

## Estimated Effort
3-4 hours`,
    labels: ['mobile', 'phase-3', 'priority:low', 'feature']
  },
  {
    title: '[Mobile] Dark Mode Support',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement dark mode theme that follows system preference.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/theme/colors.ts
mobile/src/theme/ThemeProvider.tsx
\`\`\`

## Description
Create dark mode theme and implement theme switching based on system preference or user choice.

## Acceptance Criteria
- [ ] Define light theme colors
- [ ] Define dark theme colors
- [ ] Create ThemeProvider
- [ ] Follow system preference
- [ ] Allow manual override
- [ ] Update all screens
- [ ] Update all components
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
8-10 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'ui/ux']
  }
];

const phase3FinalIssues = [
  {
    title: '[Mobile] Loading Skeletons',
    body: `## Project Context
Phase 3: Mobile App MVP - Add skeleton loading states for better perceived performance.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/components/skeletons/CorridorSkeleton.tsx
mobile/src/components/skeletons/AnchorSkeleton.tsx
mobile/src/components/skeletons/MetricCardSkeleton.tsx
\`\`\`

## Description
Create skeleton loading components for all major screens to improve perceived performance.

## Acceptance Criteria
- [ ] Create corridor card skeleton
- [ ] Create anchor card skeleton
- [ ] Create metric card skeleton
- [ ] Add to dashboard screen
- [ ] Add to corridors screen
- [ ] Add to anchors screen
- [ ] Add shimmer animation
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
5-6 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'ui/ux']
  },
  {
    title: '[Mobile] Error Boundary Implementation',
    body: `## Project Context
Phase 3: Mobile App MVP - Implement error boundaries to catch and handle React errors gracefully.

## Task Type
- [x] Feature
- [x] Enhancement

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/components/ErrorBoundary.tsx
mobile/src/screens/ErrorScreen.tsx
\`\`\`

## Description
Create error boundary component that catches React errors and displays user-friendly error screen.

## Acceptance Criteria
- [ ] Create ErrorBoundary component
- [ ] Create error screen UI
- [ ] Log errors to Sentry
- [ ] Add retry button
- [ ] Add report button
- [ ] Show error details (dev mode)
- [ ] Wrap app in error boundary
- [ ] Test error scenarios

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'enhancement']
  },
  {
    title: '[Mobile] Sentry Integration for Crash Reporting',
    body: `## Project Context
Phase 3: Mobile App MVP - Integrate Sentry for crash reporting and error tracking.

## Task Type
- [x] Feature
- [x] DevOps

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/services/sentry.ts
mobile/App.tsx
\`\`\`

## Description
Set up Sentry SDK for crash reporting, error tracking, and performance monitoring.

## Acceptance Criteria
- [ ] Install Sentry SDK
- [ ] Configure Sentry DSN
- [ ] Initialize Sentry on app start
- [ ] Capture JavaScript errors
- [ ] Capture native crashes
- [ ] Add user context
- [ ] Add breadcrumbs
- [ ] Test error reporting

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'devops']
  },
  {
    title: '[Mobile] Performance Monitoring',
    body: `## Project Context
Phase 3: Mobile App MVP - Track app performance metrics like screen load times and API response times.

## Task Type
- [x] Feature
- [x] Performance

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/services/performance.ts
mobile/src/hooks/usePerformanceTracking.ts
\`\`\`

## Description
Implement performance monitoring to track screen load times, API response times, and app metrics.

## Acceptance Criteria
- [ ] Track screen load times
- [ ] Track API response times
- [ ] Track app launch time
- [ ] Track memory usage
- [ ] Send metrics to backend
- [ ] Add performance alerts
- [ ] Create performance dashboard
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
6-8 hours`,
    labels: ['mobile', 'phase-3', 'priority:low', 'performance']
  },
  {
    title: '[Mobile] Analytics Event Tracking',
    body: `## Project Context
Phase 3: Mobile App MVP - Track user interactions and app usage with analytics events.

## Task Type
- [x] Feature
- [x] Enhancement

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/services/analytics.ts
mobile/src/hooks/useAnalytics.ts
\`\`\`

## Description
Implement analytics tracking for user interactions, screen views, and feature usage.

## Acceptance Criteria
- [ ] Track screen views
- [ ] Track button clicks
- [ ] Track search queries
- [ ] Track network switches
- [ ] Track authentication events
- [ ] Send events to backend
- [ ] Add user properties
- [ ] Test event tracking

## Dependencies
None

## Estimated Effort
5-6 hours`,
    labels: ['mobile', 'phase-3', 'priority:low', 'feature']
  },
  {
    title: '[Mobile] App Icon and Branding',
    body: `## Project Context
Phase 3: Mobile App MVP - Create app icons and branding assets for iOS and Android.

## Task Type
- [x] UI/UX
- [x] Enhancement

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/ios/StellarInsights/Images.xcassets/AppIcon.appiconset/
mobile/android/app/src/main/res/mipmap-*/
\`\`\`

## Description
Design and implement app icons for all required sizes on iOS and Android.

## Acceptance Criteria
- [ ] Design app icon
- [ ] Generate iOS icon sizes
- [ ] Generate Android icon sizes
- [ ] Add adaptive icon (Android)
- [ ] Update splash screen
- [ ] Add app name
- [ ] Test on both platforms
- [ ] Verify icon guidelines

## Dependencies
None

## Estimated Effort
4-5 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'ui/ux']
  },
  {
    title: '[Mobile] Haptic Feedback',
    body: `## Project Context
Phase 3: Mobile App MVP - Add haptic feedback for button presses and interactions.

## Task Type
- [x] Feature
- [x] UI/UX

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/utils/haptics.ts
\`\`\`

## Description
Implement haptic feedback for button presses, pull-to-refresh, and other interactions.

## Acceptance Criteria
- [ ] Add haptics to button presses
- [ ] Add haptics to pull-to-refresh
- [ ] Add haptics to network switch
- [ ] Add haptics to errors
- [ ] Support iOS haptic engine
- [ ] Support Android vibration
- [ ] Make haptics optional
- [ ] Test on both platforms

## Dependencies
None

## Estimated Effort
3-4 hours`,
    labels: ['mobile', 'phase-3', 'priority:low', 'ui/ux']
  },
  {
    title: '[Mobile] Accessibility Improvements',
    body: `## Project Context
Phase 3: Mobile App MVP - Ensure app is accessible with screen readers and accessibility features.

## Task Type
- [x] Enhancement
- [x] UI/UX

## Action Required
- [x] Update Existing File(s)

## File Locations Involved
\`\`\`
mobile/src/components/**/*.tsx
mobile/src/screens/**/*.tsx
\`\`\`

## Description
Add accessibility labels, hints, and roles to all interactive elements for screen reader support.

## Acceptance Criteria
- [ ] Add accessibility labels
- [ ] Add accessibility hints
- [ ] Add accessibility roles
- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Support dynamic text sizing
- [ ] Add focus management
- [ ] Test keyboard navigation

## Dependencies
None

## Estimated Effort
8-10 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'accessibility']
  },
  {
    title: '[Mobile] Unit Tests for Services',
    body: `## Project Context
Phase 3: Mobile App MVP - Write unit tests for all service modules.

## Task Type
- [x] Testing

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/src/services/__tests__/api.test.ts
mobile/src/services/__tests__/auth.test.ts
mobile/src/services/__tests__/storage.test.ts
\`\`\`

## Description
Write comprehensive unit tests for API client, authentication, storage, and other services.

## Acceptance Criteria
- [ ] Test API client methods
- [ ] Test authentication flow
- [ ] Test storage operations
- [ ] Test network monitoring
- [ ] Test offline queue
- [ ] Achieve >80% coverage
- [ ] Mock external dependencies
- [ ] Test error scenarios

## Dependencies
None

## Estimated Effort
10-12 hours`,
    labels: ['mobile', 'phase-3', 'priority:high', 'testing']
  },
  {
    title: '[Mobile] E2E Tests with Detox',
    body: `## Project Context
Phase 3: Mobile App MVP - Set up end-to-end testing with Detox framework.

## Task Type
- [x] Testing
- [x] DevOps

## Action Required
- [x] Create New File(s)

## File Locations Involved
\`\`\`
mobile/e2e/init.js
mobile/e2e/login.test.js
mobile/e2e/dashboard.test.js
\`\`\`

## Description
Set up Detox for E2E testing and write tests for critical user flows.

## Acceptance Criteria
- [ ] Install and configure Detox
- [ ] Write login flow test
- [ ] Write dashboard test
- [ ] Write corridors list test
- [ ] Write network switch test
- [ ] Run tests in CI
- [ ] Test on both platforms
- [ ] Document test setup

## Dependencies
None

## Estimated Effort
12-15 hours`,
    labels: ['mobile', 'phase-3', 'priority:medium', 'testing']
  }
];

// Combine all issues
const allIssues = [
  ...issues,
  ...phase1Issues,
  ...phase1MoreIssues,
  ...phase2Issues,
  ...phase2MoreIssues,
  ...phase3Issues,
  ...phase3MoreIssues,
  ...phase3FinalIssues
];

console.log(`\n📋 Total issues to create: ${allIssues.length}\n`);
console.log('Creating GitHub issues...\n');

allIssues.forEach((issue, index) => {
  try {
    // Escape special characters for shell
    const title = issue.title.replace(/'/g, "'\\''");
    const body = issue.body.replace(/'/g, "'\\''").replace(/`/g, '\\`');
    const labels = issue.labels.join(',');
    
    const cmd = `gh issue create --title '${title}' --body '${body}' --label '${labels}'`;
    
    console.log(`[${index + 1}/${allIssues.length}] Creating: ${issue.title}`);
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✓ Created issue ${index + 1}\n`);
    
    // Small delay to avoid rate limiting
    if ((index + 1) % 10 === 0) {
      console.log('⏸️  Pausing for 2 seconds to avoid rate limiting...\n');
      execSync('sleep 2');
    }
  } catch (error) {
    console.error(`✗ Failed to create issue ${index + 1}: ${error.message}\n`);
  }
});

console.log(`\n✅ Done! Created ${allIssues.length} issues.`);

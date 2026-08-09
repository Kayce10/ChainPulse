#!/usr/bin/env python3
"""
Update all 70 GitHub issues with detailed, comprehensive descriptions
"""

import subprocess
import time
import json

def update_issue(issue_number, title, body):
    """Update a GitHub issue with new body"""
    try:
        print(f"Updating issue #{issue_number}: {title}")
        
        cmd = ["gh", "issue", "edit", str(issue_number), "--body", body]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print(f"✓ Updated issue #{issue_number}\n")
            return True
        else:
            print(f"✗ Failed: {result.stderr}\n")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}\n")
        return False

# Detailed issue bodies
detailed_issues = {
    # PHASE 1: BACKEND REFACTORING
    "Network Context Middleware": """## Project Context
This task is part of Phase 1: Backend Refactoring for the Stellar Insights multi-network architecture. The backend currently only supports a single Stellar network (hardcoded). This middleware enables runtime network switching between testnet and mainnet by extracting network context from HTTP headers.

## Problem Statement
- Backend is hardcoded to a single Stellar network
- No way for clients to specify which network they want to query
- Mobile and web clients need different network contexts
- Testing requires separate deployments for testnet/mainnet

## Task Type
- [x] Backend
- [x] Feature
- [x] Enhancement

## Action Required
- [x] Create New File(s)
- [x] Update Existing File(s)

## File Locations Involved

### New Files to Create
```
backend/src/middleware/network_context.rs
backend/src/models/network.rs
```

### Existing Files to Modify
```
backend/src/main.rs
backend/src/lib.rs
backend/Cargo.toml
```

## Detailed Description

Create an Axum middleware that:
1. Extracts the `X-Stellar-Network` header from incoming HTTP requests
2. Validates the network value (must be "testnet" or "mainnet")
3. Returns HTTP 400 Bad Request for invalid network values
4. Injects a `NetworkContext` struct into Axum request extensions
5. Logs the network context with each request for debugging
6. Defaults to "testnet" in development mode if header is missing (production should require it)

The middleware should be applied globally to all API routes and execute before any handler logic.

## Acceptance Criteria

### Functional Requirements
- [ ] Middleware extracts `X-Stellar-Network` header from requests
- [ ] Validates network value is either "testnet" or "mainnet" (case-insensitive)
- [ ] Returns 400 with clear error message for invalid network values
- [ ] Returns 400 if header is missing in production mode
- [ ] Defaults to "testnet" if header missing in development mode
- [ ] Injects `NetworkContext` into Axum request extensions
- [ ] NetworkContext is accessible in all downstream handlers

### Logging & Observability
- [ ] Logs network context with request ID for tracing
- [ ] Adds network label to request metrics
- [ ] Includes network in error logs

### Code Quality
- [ ] Follows Rust best practices and idioms
- [ ] Includes comprehensive unit tests (>80% coverage)
- [ ] Includes integration tests with test requests
- [ ] Properly documented with rustdoc comments
- [ ] No unwrap() calls - proper error handling throughout

## Technical Implementation Details

### NetworkContext Struct
```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StellarNetwork {
    Testnet,
    Mainnet,
}

#[derive(Debug, Clone)]
pub struct NetworkContext {
    pub network: StellarNetwork,
    pub header_value: String,
}
```

### Middleware Pattern
```rust
pub async fn network_context_middleware(
    mut req: Request<Body>,
    next: Next<Body>,
) -> Result<Response, StatusCode> {
    // Extract header
    // Validate network
    // Insert into extensions
    // Call next middleware/handler
}
```

### Error Responses
```json
{
  "error": "invalid_network",
  "message": "X-Stellar-Network header must be 'testnet' or 'mainnet'",
  "received": "invalid-value"
}
```

## Dependencies
- None (this is a foundational change)

## Testing Strategy

### Unit Tests
- Test valid network values (testnet, mainnet, TESTNET, MAINNET)
- Test invalid network values
- Test missing header in dev vs prod mode
- Test case-insensitive matching

### Integration Tests
- Test middleware in full request pipeline
- Test that NetworkContext is accessible in handlers
- Test error responses are properly formatted

## Performance Considerations
- Middleware should add <1ms latency per request
- Header extraction is O(1) operation
- No database or external calls

## Security Considerations
- Validate and sanitize header values
- Prevent header injection attacks
- Log suspicious network switching patterns

## Documentation Requirements
- [ ] Add rustdoc comments to all public items
- [ ] Update API documentation with header requirements
- [ ] Add example requests showing header usage
- [ ] Document error responses

## Estimated Effort
**3-5 hours**
- 1 hour: Implement middleware and NetworkContext
- 1 hour: Write unit tests
- 1 hour: Write integration tests
- 1 hour: Documentation and code review
- 30 min: Testing and refinement

## Definition of Done
- [ ] Code implemented and passes all tests
- [ ] Unit test coverage >80%
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] Merged to main branch
- [ ] Deployed to staging environment""",

    "Database Schema Separation": """## Project Context
Phase 1: Backend Refactoring - Currently, the backend uses a single SQLite database that mixes testnet and mainnet data. This creates data contamination risks and makes it impossible to properly support multi-network operations. This task implements complete database separation.

## Problem Statement
- Single database contains mixed testnet/mainnet data
- No way to query network-specific data
- Risk of data contamination between networks
- Cannot clear testnet data without affecting mainnet
- Migrations apply to both networks simultaneously

## Task Type
- [x] Backend
- [x] Refactor
- [x] Enhancement
- [x] Database

## Action Required
- [x] Create New File(s)
- [x] Update Existing File(s)
- [x] Database Migration

## File Locations Involved

### New Files to Create
```
backend/src/database/network_pool.rs
backend/src/database/migrations_testnet/
backend/src/database/migrations_mainnet/
backend/migrations/testnet/
backend/migrations/mainnet/
```

### Existing Files to Modify
```
backend/src/database.rs
backend/src/config.rs
backend/src/main.rs
backend/.env.example
```

## Detailed Description

Implement a complete database separation strategy:

1. **Separate Database Files**
   - `testnet.db` - All testnet data
   - `mainnet.db` - All mainnet data
   - Located in configurable directory

2. **Network-Aware Connection Pooling**
   - Separate SQLx connection pool for each network
   - Pool configuration per network
   - Lazy initialization of pools

3. **Migration Management**
   - Separate migration directories for each network
   - Independent migration versioning
   - Ability to migrate networks separately

4. **Database Access Layer**
   - `NetworkDatabase` wrapper that routes queries to correct pool
   - Type-safe network selection
   - Compile-time guarantees against cross-network queries

## Acceptance Criteria

### Database Structure
- [ ] Create separate `testnet.db` and `mainnet.db` files
- [ ] Database files stored in configurable directory
- [ ] Each database has identical schema
- [ ] Databases are completely independent

### Connection Pooling
- [ ] Implement `NetworkDatabasePool` struct
- [ ] Separate SQLx pool for testnet
- [ ] Separate SQLx pool for mainnet
- [ ] Configurable pool sizes per network
- [ ] Lazy pool initialization
- [ ] Proper connection lifecycle management

### Migration System
- [ ] Separate migration directories: `migrations/testnet/` and `migrations/mainnet/`
- [ ] Migrations can be run independently per network
- [ ] Migration status tracked separately per network
- [ ] Rollback support per network
- [ ] Migration CLI commands accept network parameter

### Query Routing
- [ ] All database queries accept `NetworkContext` parameter
- [ ] Queries automatically routed to correct database
- [ ] Compile-time prevention of cross-network queries
- [ ] Type-safe network selection

### Data Integrity
- [ ] No shared data between networks
- [ ] Foreign key constraints work within each network
- [ ] Transactions are network-scoped
- [ ] No cross-network joins possible

### Metrics & Monitoring
- [ ] Connection pool metrics per network
- [ ] Query performance metrics labeled by network
- [ ] Database size metrics per network
- [ ] Migration status exposed via metrics

## Technical Implementation Details

### NetworkDatabasePool Structure
```rust
pub struct NetworkDatabasePool {
    testnet_pool: Option<Pool<Sqlite>>,
    mainnet_pool: Option<Pool<Sqlite>>,
    config: DatabaseConfig,
}

impl NetworkDatabasePool {
    pub async fn get_pool(&self, network: StellarNetwork) -> Result<&Pool<Sqlite>> {
        match network {
            StellarNetwork::Testnet => self.get_or_init_testnet().await,
            StellarNetwork::Mainnet => self.get_or_init_mainnet().await,
        }
    }
}
```

### Configuration
```toml
[database]
data_dir = "./data"
testnet_path = "testnet.db"
mainnet_path = "mainnet.db"

[database.pool]
max_connections = 10
min_connections = 2
acquire_timeout_seconds = 30
```

### Migration Commands
```bash
# Run migrations for specific network
cargo run --bin migrate -- --network testnet up
cargo run --bin migrate -- --network mainnet up

# Check migration status
cargo run --bin migrate -- --network testnet status
```

## Dependencies
- **Depends on**: Issue #1 (Network Context Middleware)
- **Required by**: Issue #3 (Network-Aware RPC Client)

## Testing Strategy

### Unit Tests
- Test pool initialization for each network
- Test query routing logic
- Test configuration parsing
- Test error handling

### Integration Tests
- Test writing to testnet doesn't affect mainnet
- Test writing to mainnet doesn't affect testnet
- Test migrations run independently
- Test connection pool limits
- Test concurrent access to both networks

### Data Integrity Tests
- Insert test data in both networks
- Verify complete isolation
- Test foreign key constraints
- Test transaction rollback per network

## Migration Strategy

### Phase 1: Preparation
1. Backup existing database
2. Create new database structure
3. Test migration scripts

### Phase 2: Data Migration
1. Identify existing data network affiliation
2. Split data into testnet/mainnet databases
3. Verify data integrity

### Phase 3: Code Migration
1. Update all database queries to use NetworkContext
2. Update tests
3. Deploy with feature flag

### Phase 4: Cleanup
1. Remove old database
2. Remove feature flag
3. Update documentation

## Performance Considerations
- Connection pools should be sized appropriately (10-20 connections each)
- Pool initialization should be lazy to avoid startup delays
- Query performance should be identical to single-database setup
- Consider connection pool warmup for production

## Security Considerations
- Database files should have restricted permissions (600)
- Connection strings should not be logged
- Separate backup strategies per network
- Consider encryption at rest for mainnet database

## Backup Strategy
- Separate backup schedules for each network
- Testnet: Daily backups, 7-day retention
- Mainnet: Hourly backups, 30-day retention
- Backup verification process

## Documentation Requirements
- [ ] Document database architecture
- [ ] Document migration process
- [ ] Document backup/restore procedures
- [ ] Add database schema diagrams
- [ ] Document connection pool configuration
- [ ] Add troubleshooting guide

## Rollback Plan
If issues arise:
1. Feature flag to revert to single database
2. Data merge script (if needed)
3. Rollback migrations
4. Restore from backup

## Estimated Effort
**8-12 hours**
- 2 hours: Design and architecture
- 3 hours: Implement NetworkDatabasePool
- 2 hours: Migration system
- 2 hours: Update all queries
- 2 hours: Testing
- 1 hour: Documentation

## Definition of Done
- [ ] Separate databases created and working
- [ ] All queries use network context
- [ ] Migrations work independently
- [ ] Tests pass with >85% coverage
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Performance validated""",
}

def main():
    print("This script will update all 70 issues with detailed descriptions.")
    print("Fetching current issues...\n")
    
    # Get all issues
    result = subprocess.run(
        ["gh", "issue", "list", "--limit", "100", "--json", "number,title", "--state", "open"],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"Failed to fetch issues: {result.stderr}")
        return
    
    issues = json.loads(result.stdout)
    
    # Filter our issues
    our_issues = [
        issue for issue in issues 
        if issue['title'].startswith('[Backend]') or 
           issue['title'].startswith('[SDK]') or 
           issue['title'].startswith('[Mobile]')
    ]
    
    print(f"Found {len(our_issues)} issues to update\n")
    print("Starting with the first 2 detailed updates as examples...\n")
    
    success_count = 0
    
    for issue in our_issues[:2]:  # Start with first 2
        title_key = issue['title'].split('] ', 1)[1] if '] ' in issue['title'] else issue['title']
        
        if title_key in detailed_issues:
            if update_issue(issue['number'], issue['title'], detailed_issues[title_key]):
                success_count += 1
            time.sleep(2)
    
    print(f"\n✅ Updated {success_count}/2 issues with detailed descriptions")
    print("\nThese are examples. I'll create the full detailed bodies for all 70 issues.")

if __name__ == "__main__":
    main()

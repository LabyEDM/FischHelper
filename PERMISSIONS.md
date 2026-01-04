# Permission System - Future Implementation

This document outlines the planned permission system for the FischPedia database.

## Current Implementation

Currently, the web interface allows anyone with a GitHub Personal Access Token (PAT) to edit the `fishdata.json` file directly. This is suitable for initial development and trusted contributors.

## Planned Permission System

### Phase 1: Whitelist System (Simple)
- Maintain a list of approved GitHub usernames
- Check username against whitelist before allowing edits
- Whitelist stored in `data/contributors.json` or repository settings

### Phase 2: Role-Based Access
- **Viewers**: Can view database only
- **Contributors**: Can add new fish (requires approval)
- **Editors**: Can add and edit fish (auto-approved)
- **Admins**: Full access including deletion and user management

### Phase 3: Approval Workflow
- Contributors submit fish entries
- Entries go to a "pending" queue
- Admins/Editors review and approve/reject
- Approved entries are merged into main database

### Phase 4: OAuth Integration
- Replace PAT system with GitHub OAuth
- Users authenticate through GitHub
- Permissions checked server-side
- Better security and user experience

## Implementation Options

### Option A: GitHub-Based (No Backend)
- Use GitHub Issues for approval workflow
- Contributors create issues with fish data
- Admins review and merge via GitHub interface
- Pros: No backend needed, uses GitHub features
- Cons: Manual approval process

### Option B: Backend Service
- Create a simple backend (Node.js/Python)
- Store permissions in database
- Handle OAuth and API calls server-side
- Pros: Full control, better security
- Cons: Requires hosting and maintenance

### Option C: GitHub Actions
- Use GitHub Actions for automated checks
- Validate submissions against rules
- Auto-merge if criteria met, otherwise create PR
- Pros: Automated, uses GitHub infrastructure
- Cons: Limited flexibility

## Recommended Approach

**For Now (Phase 0):**
- Current PAT system is fine for trusted contributors
- Document token creation process clearly
- Monitor repository for abuse

**Short Term (Phase 1):**
- Implement username whitelist
- Store in `data/contributors.json`
- Check on client-side (can be bypassed, but good enough for now)

**Medium Term (Phase 2-3):**
- Implement approval workflow using GitHub Issues
- Contributors submit via web interface → creates GitHub Issue
- Admins review and merge manually
- No backend required

**Long Term (Phase 4):**
- Implement proper OAuth flow
- Backend service for permission management
- Full role-based access control

## Security Considerations

1. **Token Storage**: Currently stored in localStorage (client-side only)
2. **Token Permissions**: Should only have `repo` scope, not `admin`
3. **Rate Limiting**: GitHub API has rate limits (5000 requests/hour for authenticated users)
4. **Validation**: Always validate fish data format before committing
5. **Backup**: Regular backups of `fishdata.json` in case of malicious edits

## Example Whitelist Format

```json
{
  "admins": ["LabyEDM"],
  "editors": ["trusted_user1", "trusted_user2"],
  "contributors": ["contributor1", "contributor2"]
}
```

## Next Steps

1. Create `data/contributors.json` with initial whitelist
2. Update `app.js` to check whitelist before allowing edits
3. Add admin interface for managing contributors
4. Implement approval workflow using GitHub Issues


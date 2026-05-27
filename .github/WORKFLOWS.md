# GitHub Workflows Documentation

This document describes all the GitHub Actions workflows configured for the Omni-Grid project.

## 🆕 Recent Improvements (2025-12-27)

All workflows have been enhanced with:

- ✅ Better error handling and recovery
- ✅ Comprehensive test coverage reporting
- ✅ ESLint and Prettier integration
- ✅ Improved PR commenting and feedback
- ✅ Enhanced security scanning
- ✅ Better artifact management
- ✅ Timeout protection
- ✅ Retry logic where appropriate

## 🔄 Continuous Integration Workflows

### CI Workflow (`ci.yml`)

**Triggers:** Push to main/develop, Pull Requests, Manual dispatch

**Purpose:** Ensures code quality and builds successfully

**Jobs:**

- **Build and Test** (Matrix: Node.js 18.x, 20.x):
  - ✅ Install dependencies with npm ci
  - ✅ TypeScript type checking via `npm run typecheck`
  - ✅ **Run Vitest tests** with `npm run test:run`
  - ✅ Frontend build verification (Vite)
  - ✅ C++ server compilation with Make
  - ✅ Binary verification
  - ✅ Upload build artifacts (dist/ and omnigrid_server)
- **Code Quality Check**:
  - ✅ **ESLint** validation with `npm run lint`
  - ✅ **Prettier** format checking with `npm run format:check`
  - ✅ Console.log detection (fails build if found in source)
  - ✅ TODO/FIXME comment detection (warning only)
- **Test Coverage**:
  - ✅ Run tests with coverage reporting
  - ✅ Upload coverage artifacts
  - ✅ **Post coverage report as PR comment**

**Artifacts:**

- Build artifacts (dist/ and omnigrid_server) - 7 days
- Coverage reports - 7 days

**Permissions:** contents:read, checks:write, pull-requests:write

---

## 🔒 Security Workflows

### CodeQL Security Scan (`codeql.yml`)

**Triggers:** Push to main/develop, Pull Requests, Weekly on Monday, Manual dispatch

**Purpose:** Automated security vulnerability scanning

**Jobs:**

- **Analyze Code** (Matrix: JavaScript, C++):
  - ✅ Initialize CodeQL with security-and-quality queries
  - ✅ Path-based exclusions (node_modules, dist, coverage, test)
  - ✅ Separate build process for C++ with manual compilation
  - ✅ Node.js setup for JavaScript analysis
  - ✅ SARIF results upload
  - ✅ Timeout protection (360 minutes)

**Languages Analyzed:** JavaScript/TypeScript, C++

**Improvements:**

- Better path exclusions to reduce false positives
- Manual C++ build for better analysis
- Proper environment setup per language
- Enhanced timeout protection

---

### Dependency Audit (`audit.yml`)

**Triggers:** Push to main/develop, Pull Requests, Daily at midnight, Manual dispatch

**Purpose:** Security audit of npm dependencies

**Jobs:**

- **Security Audit**:
  - ✅ Run `npm audit` at moderate severity level
  - ✅ Check for outdated packages
  - ✅ Generate comprehensive dependency report
  - ✅ **Post PR comment if vulnerabilities found**
  - ✅ Fail builds on non-scheduled runs with vulnerabilities
  - ✅ Continue on errors for scheduled runs

**Artifacts:**

- Dependency audit report - 30 days
- Audit output logs - 30 days

**Permissions:** contents:read, issues:write, pull-requests:write

**New Features:**

- PR commenting on vulnerabilities
- Smart failure logic (fail on PR, warn on schedule)
- Better reporting format

---

## 📦 Release & Deployment Workflows

### Release (`release.yml`)

**Triggers:** Git tags matching `v*.*.*`, Manual dispatch with version input

**Purpose:** Automated release creation with build artifacts

**Jobs:**

- **Build Release Artifacts**:
  - ✅ Checkout with full history (fetch-depth: 0)
  - ✅ **Run tests before release** (`npm run test:run`)
  - ✅ Build frontend and C++ server
  - ✅ Verify builds before packaging
  - ✅ Create .tar.gz and .zip archives
  - ✅ **Generate SHA-256 checksums**
  - ✅ Copy all documentation files
  - ✅ Include .env.example
  - ✅ Generate comprehensive release notes
  - ✅ Publish GitHub release with all artifacts
  - ✅ Timeout protection (30 minutes)

**Artifacts Published:**

- omni-grid-release.tar.gz (with checksum)
- omni-grid-release.zip (with checksum)
- Release notes

**Artifacts Retained:** 90 days

**New Features:**

- Pre-release testing
- Checksum generation for security
- Build verification
- Enhanced release notes
- Better artifact organization

---

### Deploy Documentation (`docs.yml`)

**Triggers:** Push to main (docs/_, _.md files, workflow file), Manual dispatch

**Purpose:** Deploys documentation to GitHub Pages

**Jobs:**

- **Deploy Docs**:
  - ✅ Setup GitHub Pages environment
  - ✅ Copy all documentation files with error handling
  - ✅ **Create beautiful, responsive HTML documentation portal**
  - ✅ Include CONTRIBUTING.md
  - ✅ Modern design with gradients and hover effects
  - ✅ Mobile-responsive layout
  - ✅ Deploy to GitHub Pages with environment URL

**Features:**

- Comprehensive HTML landing page
- Card-based navigation
- Dark theme with neon accents
- Error handling for missing files
- Direct GitHub link

**Environment:** github-pages with URL output

---

## 🤖 Automation Workflows

### Dependabot Configuration (`dependabot.yml`)

**Schedule:** Weekly on Monday at 09:00 UTC

**Purpose:** Automated dependency updates

**Ecosystems:**

- **npm**: JavaScript/TypeScript dependencies
- **GitHub Actions**: Workflow action versions

**Features:**

- Automatic PR creation for updates
- Weekly schedule to minimize noise
- Labels: `dependencies`, `automated`
- Auto-reviewers assigned

---

### Auto-merge Dependabot (`auto-merge-dependabot.yml`)

**Triggers:** Pull Request events from Dependabot

**Purpose:** Automatically merge safe dependency updates

**Jobs:**

- **Auto-merge**:
  - ✅ Fetch Dependabot metadata
  - ✅ Check update type (major/minor/patch)
  - ✅ Auto-approve minor and patch updates
  - ✅ Enable auto-merge for safe updates
  - ✅ Comment on major updates requiring manual review

**Safety:** Only auto-merges minor and patch updates

---

### PR Labeler (`pr-labeler.yml`)

**Triggers:** Pull Request opened, synchronized, or reopened

**Purpose:** Automatically label PRs based on changes

**Jobs:**

- **Auto-label**:
  - ✅ Labels based on file paths (using labeler.yml config)
  - ✅ Size-based labeling (XS, S, M, L, XL)
  - ✅ Path categories: documentation, frontend, backend, services, configuration, dependencies, ci-cd

**Configuration:** `.github/labeler.yml`

**Permissions:** contents:read, pull-requests:write

---

### Stale Issues and PRs (`stale.yml`)

**Triggers:** Daily at midnight, Manual dispatch

**Purpose:** Manage inactive issues and pull requests

**Jobs:**

- **Mark Stale**:
  - ✅ Issues: Stale after 60 days, closed after 7 more days
  - ✅ PRs: Stale after 30 days, closed after 14 more days
  - ✅ Exempt labels: `keep-open`, `pinned`, `security`, `bug`, `in-progress`
  - ✅ Friendly messages with guidance

**Permissions:** issues:write, pull-requests:write

---

### Welcome (`welcome.yml`)

**Triggers:** New issues or pull requests opened

**Purpose:** Welcome and guide first-time contributors

**Jobs:**

- **Welcome**:
  - ✅ Detect first-time contributors
  - ✅ Post welcoming message with helpful resources
  - ✅ Link to contributing guidelines and documentation
  - ✅ Custom messages for issues vs PRs

**Permissions:** issues:write, pull-requests:write

---

## 📊 Monitoring Workflows

### Performance Check (`performance.yml`)

**Triggers:** Pull Requests to main/develop, Manual dispatch

**Purpose:** Monitor build performance and bundle sizes

**Jobs:**

- **Measure Performance**:
  - ✅ Measure frontend build time with timing
  - ✅ Report bundle size and largest assets
  - ✅ Detect large chunks (>500KB warning)
  - ✅ Measure C++ compilation time
  - ✅ **Update existing PR comments** (avoid spam)
  - ✅ Better error handling with continue-on-error
  - ✅ Upload build logs for debugging
  - ✅ Status indicators (✅/❌) in reports

**Artifacts:**

- Performance report - 30 days
- Build logs - 30 days

**Permissions:** contents:read, pull-requests:write

**New Features:**

- Comment updating instead of creating new comments
- Warning on large files
- Better error handling
- Build status indicators

---

### Screenshot Assets (`assets.yml`)

**Triggers:** Push and PRs touching `docs/screenshots/**`, Manual dispatch

**Purpose:** Generate reproducible screenshot asset manifests and downloadable archives

**Jobs:**

- **Generate screenshot artifacts**:
  - ✅ Generate `screenshots-manifest.json` with SHA-256 checksums
  - ✅ Generate `screenshots-summary.md` inventory table
  - ✅ Package screenshots into `screenshots.tar.gz`
  - ✅ Upload artifact bundle for release/docs consumers

**Artifacts:**

- Screenshot manifest, summary, archive, and checksums - 30 days

---

### Workflow Status (`status.yml`)

**Triggers:** Completion of CI, CodeQL, Audit, or Performance workflows, Manual dispatch

**Purpose:** Generate comprehensive workflow status dashboard

**Jobs:**

- **Status Summary**:
  - ✅ Aggregate status of all major workflows
  - ✅ **Display as formatted table** with status, conclusion, and date
  - ✅ Show latest commit information
  - ✅ Display open issues and PR counts
  - ✅ Provide quick links to resources
  - ✅ Enhanced error handling with continue-on-error
  - ✅ Generate workflow summary

**Permissions:** actions:read, contents:read

**New Features:**

- Table-based status display
- Repository health metrics
- Latest commit info
- Better error handling
- More comprehensive quick links

---

## 📋 Configuration Files

### Issue Templates

Located in `.github/ISSUE_TEMPLATE/`

- **Bug Report** (`bug_report.yml`): Structured template for reporting bugs
- **Feature Request** (`feature_request.yml`): Template for proposing new features
- **Config** (`config.yml`): Links to documentation and community resources

### Pull Request Template

Located in `.github/PULL_REQUEST_TEMPLATE.md`

Provides standardized structure for PRs:

- Description and related issues
- Type of change
- Testing information
- Review checklist
- Screenshots and notes

---

## 🏷️ Labeler Configuration

File: `.github/labeler.yml`

**Automatic Labels:**

- `documentation`: Changes to docs/\*_ or _.md files
- `frontend`: Changes to components/, widgets/, \*.tsx files
- `backend`: Changes to server/ or C++ files
- `services`: Changes to services/
- `configuration`: Changes to config files
- `dependencies`: Changes to package.json
- `ci-cd`: Changes to .github/

**Size Labels:**

- `size/XS`: < 10 lines changed
- `size/S`: 10-49 lines changed
- `size/M`: 50-199 lines changed
- `size/L`: 200-499 lines changed
- `size/XL`: 500+ lines changed

---

## 🛠️ Development Commands

### New Scripts Added

```bash
# Testing
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage report

# Linting & Formatting
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting without changing files

# Type Checking
npm run typecheck     # Run TypeScript type checking

# Building
npm run build         # Build frontend
npm run build:server  # Build C++ server
npm run build:all     # Build both frontend and server
npm run assets:generate # Generate screenshot asset manifest locally
```

---

## 🎯 Best Practices

### For Contributors

1. ✅ Run `npm run lint` and `npm run format:check` before committing
2. ✅ Run `npm run test:run` to ensure all tests pass
3. ✅ Keep PRs focused and reasonably sized (< 500 lines when possible)
4. ✅ Update documentation for new features
5. ✅ Add tests for bug fixes and new features
6. ✅ Follow the PR template guidelines
7. ✅ Ensure all CI checks pass before requesting review

### For Maintainers

1. ✅ Review security alerts from CodeQL and Dependabot promptly
2. ✅ Monitor workflow performance reports
3. ✅ Keep dependencies up to date
4. ✅ Review and merge Dependabot PRs regularly
5. ✅ Use workflow badges in README to communicate project health
6. ✅ Check test coverage trends

---

## 🔧 Maintenance

### Regular Tasks

- **Daily**: Automated dependency audits and stale issue checks
- **Weekly**:
  - Review Dependabot PRs
  - Check CodeQL security scan results
- **Monthly**: Review stale issues and PRs manually
- **Quarterly**:
  - Review and update workflow configurations
  - Update CodeQL queries and security policies
  - Review test coverage trends

### Monitoring

- ✅ Check workflow status badges in README
- ✅ Review workflow run history in Actions tab
- ✅ Monitor security advisories
- ✅ Track build performance trends
- ✅ Review test coverage reports

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Vitest Documentation](https://vitest.dev/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)

---

_Last Updated: 2025-12-27_  
_For questions or issues with workflows, please open an issue with the `ci-cd` label._

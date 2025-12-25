# GitHub Workflows Documentation

This document describes all the GitHub Actions workflows configured for the Omni-Grid project.

## 🔄 Continuous Integration Workflows

### CI Workflow (`ci.yml`)
**Triggers:** Push to main/develop, Pull Requests, Manual dispatch

**Purpose:** Ensures code quality and builds successfully

**Jobs:**
- **Build and Test**: Builds both frontend (Vite) and C++ server on multiple Node.js versions (18.x, 20.x)
  - TypeScript type checking
  - Frontend build verification
  - C++ server compilation
  - Upload build artifacts
- **Code Quality Check**: Checks for common issues like console.log statements and TODO comments

**Artifacts:** Build artifacts (dist/ and omnigrid_server) retained for 7 days

---

## 🔒 Security Workflows

### CodeQL Security Scan (`codeql.yml`)
**Triggers:** Push to main/develop, Pull Requests, Weekly on Monday, Manual dispatch

**Purpose:** Automated security vulnerability scanning

**Jobs:**
- **Analyze Code**: Runs CodeQL analysis for JavaScript/TypeScript and C++
  - Security vulnerability detection
  - Code quality analysis
  - Best practices enforcement

**Languages Analyzed:** JavaScript, C++

---

### Dependency Audit (`audit.yml`)
**Triggers:** Push to main/develop, Pull Requests, Daily at midnight, Manual dispatch

**Purpose:** Security audit of npm dependencies

**Jobs:**
- **Security Audit**: 
  - Runs `npm audit` to detect vulnerable dependencies
  - Checks for outdated packages
  - Generates dependency report

**Artifacts:** Dependency report retained for 30 days

---

## 📦 Release & Deployment Workflows

### Release (`release.yml`)
**Triggers:** Git tags matching `v*.*.*`, Manual dispatch with version input

**Purpose:** Automated release creation with build artifacts

**Jobs:**
- **Build Release Artifacts**:
  - Builds frontend and C++ server
  - Creates release archives (.tar.gz and .zip)
  - Generates release notes
  - Publishes GitHub release with artifacts

**Artifacts Published:**
- omni-grid-release.tar.gz
- omni-grid-release.zip

---

### Deploy Documentation (`docs.yml`)
**Triggers:** Push to main (docs/** or *.md files), Manual dispatch

**Purpose:** Deploys documentation to GitHub Pages

**Jobs:**
- **Deploy Docs**: Creates and deploys documentation site
  - Generates static documentation portal
  - Deploys to GitHub Pages

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
  - Auto-approves minor and patch updates
  - Enables auto-merge for safe updates
  - Comments on major updates requiring manual review

---

### PR Labeler (`pr-labeler.yml`)
**Triggers:** Pull Request opened, synchronized, or reopened

**Purpose:** Automatically label PRs based on changes

**Jobs:**
- **Auto-label**: 
  - Labels based on file paths (frontend, backend, docs, etc.)
  - Labels based on PR size (XS, S, M, L, XL)

**Configuration:** `.github/labeler.yml`

---

### Stale Issues and PRs (`stale.yml`)
**Triggers:** Daily at midnight, Manual dispatch

**Purpose:** Manage inactive issues and pull requests

**Jobs:**
- **Mark Stale**: 
  - Issues: Marked stale after 60 days, closed after 7 days
  - PRs: Marked stale after 30 days, closed after 14 days
  - Exempt labels: `keep-open`, `pinned`, `security`, `bug`, `in-progress`

---

### Welcome (`welcome.yml`)
**Triggers:** New issues or pull requests opened

**Purpose:** Welcome and guide first-time contributors

**Jobs:**
- **Welcome**: 
  - Detects first-time contributors
  - Posts welcoming message with helpful resources
  - Links to contributing guidelines and documentation

---

## 📊 Monitoring Workflows

### Performance Check (`performance.yml`)
**Triggers:** Pull Requests to main/develop, Manual dispatch

**Purpose:** Monitor build performance and bundle sizes

**Jobs:**
- **Measure Performance**:
  - Measures frontend build time
  - Reports bundle size and largest assets
  - Measures C++ compilation time
  - Posts performance report as PR comment

**Artifacts:** Performance report retained for 30 days

---

### Workflow Status (`status.yml`)
**Triggers:** Completion of CI, CodeQL, Audit, or Performance workflows, Manual dispatch

**Purpose:** Generate comprehensive workflow status dashboard

**Jobs:**
- **Status Summary**:
  - Aggregates status of all workflows
  - Generates status dashboard
  - Provides quick links to actions and resources

---

## 📋 Issue & PR Templates

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
- `documentation`: Changes to docs/** or *.md files
- `frontend`: Changes to components/, widgets/, *.tsx files
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

## 🎯 Best Practices

### For Contributors
1. Ensure all CI checks pass before requesting review
2. Keep PRs focused and reasonably sized (< 500 lines when possible)
3. Update documentation for new features
4. Add tests for bug fixes and new features
5. Follow the PR template guidelines

### For Maintainers
1. Review security alerts from CodeQL and Dependabot promptly
2. Monitor workflow performance reports
3. Keep dependencies up to date
4. Review and merge Dependabot PRs regularly
5. Use workflow badges in README to communicate project health

---

## 🔧 Maintenance

### Regular Tasks
- **Weekly**: Review Dependabot PRs
- **Monthly**: Review stale issues and PRs
- **Quarterly**: Review and update workflow configurations
- **As needed**: Update CodeQL queries and security policies

### Monitoring
- Check workflow status badges in README
- Review workflow run history in Actions tab
- Monitor security advisories
- Track build performance trends

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [GitHub Security Features](https://docs.github.com/en/code-security)

---

*For questions or issues with workflows, please open an issue with the `ci-cd` label.*

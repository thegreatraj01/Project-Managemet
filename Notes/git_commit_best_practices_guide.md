# Git Commit Best Practices Guide

A clear, structured Git commit history makes software easier to review, debug, maintain, and automate. This guide outlines the standard best practices for writing high-quality Git commit messages and structuring your repository's history.

---

## 1. Anatomy of a Great Commit Message

A well-structured commit message consists of three distinct parts: a **Subject line**, a **Blank line**, and an optional **Detailed body**.

```text
<type>(<scope>): <short summary in imperative mood>

[optional body explaining WHAT changed and WHY]

[optional footer referencing issue keys, e.g., Closes #123]
```

### Example
```text
feat(user): add user schema and validation rules

- Defined Mongoose schema with required email and password fields
- Applied unique index constraint to email to prevent duplicates
- Configured timestamps option to track createdAt and updatedAt

Closes #42
```

---

## 2. The 7 Golden Rules of Commit Messages

### 1. Keep Commits Atomic
Each commit should represent a **single logical change**. Do not mix unrelated refactoring, bug fixes, and feature work into one commit.
* ❌ `git commit -m "add user API and fix CSS bug and update packages"`
* ✅ Split into three individual commits.

### 2. Use the Imperative Mood in the Subject Line
Write your subject line as if giving a command or instruction.
* **Test:** Complete the sentence *"If applied, this commit will..."*
  * ✅ *add user schema*
  * ❌ *added user schema*
  * ❌ *adds user schema*

### 3. Limit the Subject Line to 50 Characters
Short titles ensure that log outputs (`git log --oneline`) and platform UIs (GitHub/GitLab) do not truncate your message.

### 4. Separate Subject from Body with a Blank Line
Git tools treat the first line as the commit title and everything after the blank line as the body. Without the blank line, developer tools render the whole text as one giant title.

### 5. Wrap the Body at 72 Characters
Manual line wrapping at 72 characters prevents text from wrapping awkwardly in terminal log viewports.

### 6. Do Not End the Subject Line with a Period
The subject line functions as a title or header. Omit trailing punctuation.

### 7. Focus the Body on "Why" and "What", Not "How"
The code diff shows *how* the change was implemented. Use the commit body to explain:
* What problems this change solves.
* Why this specific approach was chosen over alternatives.
* Any side effects or breaking changes to be aware of.

---

## 3. Conventional Commits Specification

Adopting **Conventional Commits** provides a standardized format that enables automatic changelog generation and semantic versioning.

### Format
`<type>(<scope>): <description>`

### Standard Types

| Type | Description | Example |
| :--- | :--- | :--- |
| `feat` | A new feature for the user | `feat(auth): add JWT login endpoint` |
| `fix` | A bug fix | `fix(cart): resolve double-charge on checkout` |
| `chore` | Build tasks, configs, dependencies | `chore(deps): upgrade express to v4.18.2` |
| `refactor` | Code restructuring without feature/bug changes | `refactor(user): simplify database query logic` |
| `docs` | Documentation updates only | `docs(readme): add installation steps` |
| `style` | Formatting, white-space, missing semi-colons | `style(api): format code with Prettier` |
| `test` | Adding or updating tests | `test(user): add unit tests for user creation` |
| `perf` | Code changes that improve performance | `perf(db): add index on user email lookup` |
| `ci` | CI/CD pipeline configuration changes | `ci(github): add workflow for automated testing` |

---

## 4. Logical Commit Sequencing (Order Example)

When implementing a feature, break down the work into sequential, logical commits:

```bash
# 1. Add required packages
git commit -m "chore(deps): install mongoose and bcryptjs"

# 2. Database setup
git commit -m "feat(db): configure mongodb connection client"

# 3. Model creation
git commit -m "feat(user): define mongoose user schema and indexes"

# 4. Business logic / controller
git commit -m "feat(user): implement password hashing hook"

# 5. API endpoint
git commit -m "feat(user): create POST /api/users endpoint"

# 6. Automated tests
git commit -m "test(user): add unit tests for registration route"
```

---

## 5. How to Write Multi-Line Commits

### Option A: Using Multiple `-m` Flags in Terminal
Each `-m` flag creates a new paragraph:

```bash
git commit -m "feat(user): add user model" -m "Defined schema with email and password fields. Enabled timestamping for auditing."
```

### Option B: Using Code Editor (Recommended)
Configure your favorite editor to open automatically when running `git commit`:

```bash
# Set VS Code as default Git editor
git config --global core.editor "code --wait"

# Run git commit without -m flag to open editor
git commit
```

---

## 6. Summary Checklist

- [ ] Is the commit atomic (one logical change)?
- [ ] Is the first line under 50 characters?
- [ ] Does the first line use conventional commit types (`feat`, `fix`, `chore`)?
- [ ] Is the subject written in imperative mood ("add", not "added")?
- [ ] Is there a blank line between title and body?
- [ ] Does the body explain *why* the change was made?
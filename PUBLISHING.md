# Publishing Guide for SQLite Database Viewer

## Before Publishing

### 1. Update package.json

Replace the following placeholders in `package.json`:
- `"publisher": "your-publisher-name"` → Your VS Code Marketplace publisher ID
- `"url": "https://github.com/your-username/db-viewer"` → Your actual GitHub repo URL
- `"name": "Your Name"` → Your actual name

### 2. Create Publisher Account (if you don't have one)

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your Microsoft/GitHub account
3. Click "Create publisher"
4. Choose a unique publisher ID (letters, numbers, hyphens only)

### 3. Get Personal Access Token

1. Go to https://dev.azure.com/
2. Sign in with the same account
3. Click on User Settings (top right) → Personal Access Tokens
4. Click "New Token"
5. Settings:
   - Name: "VS Code Extension Publishing"
   - Organization: All accessible organizations
   - Expiration: Custom (choose your duration)
   - Scopes: **Marketplace** → **Manage** (check this box)
6. Click "Create" and **SAVE THE TOKEN** (you won't see it again!)

### 4. Install VSCE (VS Code Extension Manager)

```powershell
npm install -g @vscode/vsce
```

### 5. Login to VSCE

```powershell
vsce login your-publisher-name
```

Enter your Personal Access Token when prompted.

## Publishing Steps

### Option 1: Publish Directly

```powershell
cd "C:\Users\AL Aziz Computers\Desktop\Practice Sandbox\New folder\db-viewer"
vsce publish
```

### Option 2: Create Package and Upload Manually

```powershell
cd "C:\Users\AL Aziz Computers\Desktop\Practice Sandbox\New folder\db-viewer"
vsce package
```

This creates a `.vsix` file. Then:
1. Go to https://marketplace.visualstudio.com/manage
2. Click on your publisher
3. Click "New extension" → "Visual Studio Code"
4. Upload the `.vsix` file

## After Publishing

### Test Your Extension

```powershell
code --install-extension db-viewer-1.0.0.vsix
```

Or search for it in VS Code Extensions marketplace.

## Updating the Extension

1. Update version in `package.json` (e.g., 1.0.0 → 1.0.1)
2. Update `CHANGELOG.md` with changes
3. Run:
   ```powershell
   vsce publish
   ```
   Or for specific version bump:
   ```powershell
   vsce publish patch  # 1.0.0 → 1.0.1
   vsce publish minor  # 1.0.0 → 1.1.0
   vsce publish major  # 1.0.0 → 2.0.0
   ```

## Checklist Before Publishing

- [ ] Updated publisher name in package.json
- [ ] Updated repository URLs in package.json
- [ ] Updated author name in package.json and LICENSE
- [ ] README is complete and accurate
- [ ] CHANGELOG is up to date
- [ ] Extension compiles without errors (`npm run package`)
- [ ] Extension tested in debug mode (F5)
- [ ] All test files removed
- [ ] .vscodeignore is properly configured
- [ ] Created publisher account on marketplace
- [ ] Have valid Personal Access Token
- [ ] VSCE is installed globally

## Important Files

- ✅ `package.json` - Extension metadata
- ✅ `README.md` - Extension documentation
- ✅ `CHANGELOG.md` - Version history
- ✅ `LICENSE` - MIT license
- ✅ `.vscodeignore` - Files to exclude from package
- ✅ `dist/` - Compiled extension code
- ✅ `icon.svg` - Extension icon (optional for first release)

## Useful Commands

```powershell
# Show what files will be included in the package
vsce ls

# Package without publishing
vsce package

# Publish with version bump
vsce publish minor

# Unpublish (use carefully!)
vsce unpublish your-publisher-name.db-viewer
```

## Need Help?

- VS Code Publishing Guide: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- VSCE Documentation: https://github.com/microsoft/vscode-vsce
- Marketplace: https://marketplace.visualstudio.com/manage

---

Good luck with your extension! 🚀

# CollectPro — Field Collection App

A mobile-first web app for field collection boys to manage outstanding payments.

## 📁 Repository Structure

```
your-repo/
├── index.html          ← The app (this file)
├── partymst.csv        ← Party master (upload daily)
├── ledgersummary.csv   ← Ledger summary (upload daily)
├── outstanding.csv     ← Outstanding bills (upload daily)
└── README.md
```

## 🚀 Setup Steps

### 1. Create GitHub Repository
1. Go to [github.com](https://github.com) → **New repository**
2. Name it (e.g., `collect-pro` or `field-collection`)
3. Set to **Public** (required for GitHub Pages)
4. Click **Create repository**

### 2. Upload Files
Upload these 4 files to your repo:
- `index.html` (the app)
- `partymst.csv`
- `ledgersummary.csv`  
- `outstanding.csv`

### 3. Update the CSV URL in index.html
Open `index.html`, find this line near the top of the `<script>` section:

```javascript
const CSV_BASE = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/';
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repo name.

Example:
```javascript
const CSV_BASE = 'https://raw.githubusercontent.com/johnsmith/collect-pro/main/';
```

### 4. Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under "Source", select **Deploy from a branch**
3. Select **main** branch, **/ (root)** folder
4. Click **Save**
5. Wait 1-2 minutes → your site will be at:  
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### 5. Share URL with Collection Boys
Send them the GitHub Pages URL. On first visit:
- They set a **6-digit PIN** (saved on their phone)
- They select their **assigned areas**
- Only parties from their areas will be visible

---

## 📅 Daily Update Process

Every day, just replace the 3 CSV files in GitHub:
1. Go to your repo on GitHub
2. Click on the CSV file → Edit (pencil icon) → Delete
3. Upload the new file with the **same name**

Or use GitHub Desktop for easier file management.

The app fetches fresh data every time it's opened — no app update needed!

---

## 📱 Features

- 🔐 **6-digit PIN** per device (stored in phone memory)
- 📍 **Area-based filtering** — each user sees only their parties
- 🔍 **Real-time party search** with name highlighting
- 📊 **Dashboard stats** — total O/S, overdue, bill count
- 🔴 **Overdue calculation** — Total O/S minus last 3 months = overdue
- 📋 **Bill-wise details** — invoice number, date, amount, outstanding
- ⏱ **Age indicators** — green (<60d), yellow (60-90d), red (>90d overdue)
- 📞 **One-tap calling** from party detail screen
- 📍 **Full address** on detail screen

---

## 🔧 CSV Column Reference

### partymst.csv
| Column | Index | Field |
|--------|-------|-------|
| C | 2 | Party Name (key) |
| G | 6 | Address Line 1 |
| H | 7 | Address Line 2 |
| I | 8 | Address Line 3 |
| P | 15 | Mobile Number |
| X | 23 | Area Code |

### ledgersummary.csv
| Column | Index | Field |
|--------|-------|-------|
| A | 0 | Party Name (key) |
| B | 1 | Total Outstanding |
| C | 2 | This Month |
| D | 3 | Previous Month |
| E | 4 | Month Before |

**Overdue = Total − Month1 − Month2 − Month3**

### outstanding.csv
| Column | Index | Field |
|--------|-------|-------|
| A | 0 | Party Name |
| B | 1 | Bill Number |
| C | 2 | Bill Date (dd-mm-yy) |
| D | 3 | Bill Amount |
| E | 4 | Balance Pending |
| F | 5 | Days Outstanding |

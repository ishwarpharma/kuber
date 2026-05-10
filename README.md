# CollectPro — Field Collection App

Mobile-first web app for field collection boys. Admin controls all users, PINs, and areas via `users.json`.

---

## 📁 Files in this repo

```
your-repo/
├── index.html          ← The app (never edit this)
├── users.json          ← YOU manage this: users, PINs, areas
├── partymst.csv        ← Upload fresh every day
├── ledgersummary.csv   ← Upload fresh every day
├── outstanding.csv     ← Upload fresh every day
└── README.md
```

---

## 👤 Managing Users — users.json

This is the **only file you need to edit** to add/remove users or change their areas.

### Format

```json
[
  {
    "name": "Ravi Mumbai",
    "pin": "112233",
    "areas": ["1-MUM-DAWABAZAR", "1-MUM-SOBO-WHC", "11-DA-KUR-BAN"]
  },
  {
    "name": "Suresh Bhiwandi",
    "pin": "445566",
    "areas": ["23-BHIWANDI", "22-THANE", "24-KLWA-DOMBIV"]
  },
  {
    "name": "Vijay Manager",
    "pin": "000000",
    "areas": "ALL"
  }
]
```

### Rules
- `pin` — must be exactly **6 digits**, unique per user
- `areas` — array of area codes exactly as they appear in Column X of partymst.csv
- `areas: "ALL"` — user sees every party with outstanding (useful for managers)
- User **cannot change** their PIN or areas — only you can, from here

### How the PIN works on the phone
- First time: user enters their PIN → app remembers it on that phone
- Next visit: PIN is auto-filled, no re-entry needed
- Tapping **Lock** clears the remembered PIN from the phone
- If you change someone's PIN in users.json, they will need to enter the new PIN next time

---

## 🚀 One-time GitHub Setup

1. Create a **public** GitHub repository
2. Upload all files: `index.html`, `users.json`, `README.md`, and the 3 CSVs
3. Open `index.html`, find this line and update it:
   ```javascript
   const BASE = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/';
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values.
4. Go to **Settings → Pages → Deploy from branch → main / root → Save**
5. Your app URL: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## 📅 Daily Update (3 CSV files)

1. Open your GitHub repo
2. Click the CSV file → click the **pencil (edit)** icon → scroll down → **Delete file** — OR just drag the new file onto the repo page and it will replace it
3. Repeat for all 3 CSVs
4. Done — app fetches fresh data on every open (cache is bypassed automatically)

---

## 📍 Full Area Code List

Use these exact strings in `users.json → areas`:

```
#EXPORT          #HOSPITAL        #INSTITUTION SU  **CLOSE**
..               1-MUM-DAWABAZAR  1-MUM-SOBO-WHC   11-DA-KUR-BAN
12-SAN-AND-SAK   13-JOGES-BORIVA  14-DAHIS-BHAYE   15-VASAI-DAHAN
21-GHATK-MULUD   22-THANE         23-BHIWANDI      24-KLWA-DOMBIV
25-KLY-ULH-BADL  31-WADAL-MANKH   32-VASHI-PANVEL  33-TRANS HARB
AHILYANAGAR      AKOLA            AMRAVATI         BEED
BHANDARA         BULDHANA         CHANDRAPUR       COMMISSION
DHULE            GADCHIROLI       GOA              GONDIA
HINGOLI          JALGAON          JALNA            KARNATAKA
KOKAN            KOLHAPUR         LATUR            NAGPUR
NANDED           NANDURBAR        NASHIK           OMS
OSMANABAD        PARBHANI         PUNE             RAIGAD
SAMBHAJINAGAR    SANGLI           SATARA           SOLAPUR
WARDHA           WASHIM           YAVATMAL
```

---

## 🔧 CSV Column Reference

### partymst.csv
| Column | Field used |
|--------|-----------|
| C (index 2) | Party Name — key for all lookups |
| G (index 6) | Address Line 1 |
| H (index 7) | Address Line 2 |
| I (index 8) | Address Line 3 |
| P (index 15) | Mobile Number |
| X (index 23) | Area Code |

### ledgersummary.csv
| Column | Field used |
|--------|-----------|
| A | Party Name |
| B | Total Outstanding |
| C | This month's billing |
| D | Previous month |
| E | Month before that |

**Overdue = B − C − D − E** (anything older than 3 months)

### outstanding.csv
| Column | Field used |
|--------|-----------|
| A | Party Name |
| B | Bill Number |
| C | Bill Date (dd-mm-yy) |
| D | Original Bill Amount |
| E | Balance still pending |
| F | Days outstanding |

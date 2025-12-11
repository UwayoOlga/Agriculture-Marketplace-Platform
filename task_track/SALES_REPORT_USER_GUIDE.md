# 📊 Sales Report Feature - User Guide

## What is This?

The **Sales Report Feature** allows farmers to generate professional PDF reports of their sales transactions for any date range they choose. It's a key tool for tracking farm business performance.

---

## 🎯 Key Features

### 1. **Date Range Selection**
Choose any start and end date to generate reports for:
- Last 30 days (default)
- Last quarter
- Full year
- Custom date ranges

### 2. **Professional PDF Reports**
Download PDF files containing:
- All transactions for the selected period
- Product names sold
- Quantities and unit prices
- Individual and total sales amounts
- Professional formatting with farm-friendly green theme

### 3. **Sales Metrics Dashboard**
View quick summary statistics:
- **Total Sales** - Total revenue in RWF
- **Products Sold** - Number of products sold
- **Total Quantity** - Total units sold
- **Average Price** - Average price per transaction

### 4. **Easy Download**
One-click PDF download that:
- Automatically names the file with dates
- Saves to your Downloads folder
- Opens in any PDF reader

---

## 📍 Where to Find It

### Access from:
1. Log in to your farmer account
2. Navigate to **Farmer Dashboard**
3. Scroll down to find the **"📊 Sales Report"** section
4. It appears between the stats cards and "Your Products" section

### URL:
```
http://localhost:5173/farmer-dashboard
```

---

## 🎬 How to Use

### Step 1: Select Date Range
```
┌────────────────────────────────────┐
│  Start Date: [01/01/2025]          │
│  End Date:   [01/30/2025]          │
└────────────────────────────────────┘
```

**Default:** Last 30 days (auto-populated)

**To change:**
1. Click the Start Date field
2. Pick a new date from the calendar
3. Click the End Date field
4. Pick a new date from the calendar

### Step 2: Download PDF
```
Click: [📥 Download PDF]
```

**What happens:**
1. System queries all your sales in the date range
2. Generates a professional PDF report
3. Downloads to your computer
4. Shows success notification

**Example filename:** `sales_report_2025-01-01_to_2025-01-30.pdf`

### Step 3: View Report
Open the PDF file in any PDF reader:
- Windows: Edge, Adobe Reader, Chrome
- Mac: Preview, Adobe Reader
- Linux: Evince, Firefox

---

## 📄 What's in the PDF Report

### Report Header
```
═══════════════════════════════════════════════════════════
      SALES REPORT FOR [YOUR FARM NAME]
      Period: 2025-01-01 to 2025-01-30
═══════════════════════════════════════════════════════════
```

### Transaction Table
```
┌──────────────┬────────┬──────────────┬─────┬────────┐
│ Date         │ Order# │ Product      │ Qty │ Price  │
├──────────────┼────────┼──────────────┼─────┼────────┤
│ 2025-01-05   │ 1001   │ Tomatoes     │ 10  │ 500    │
│ 2025-01-10   │ 1002   │ Lettuce      │ 5   │ 300    │
│ 2025-01-15   │ 1003   │ Carrots      │ 20  │ 250    │
│ 2025-01-20   │ 1004   │ Cucumbers    │ 8   │ 400    │
│ 2025-01-25   │ 1005   │ Peppers      │ 15  │ 350    │
└──────────────┴────────┴──────────────┴─────┴────────┘

TOTAL SALES: RWF 15,750
```

### Key Information Included
- ✅ Order date (when customer ordered)
- ✅ Order number (for reference)
- ✅ Product name (what was sold)
- ✅ Quantity (how many units)
- ✅ Unit price (price per unit in RWF)
- ✅ Subtotal (quantity × price)
- ✅ **Total sales for period**

---

## 💡 Tips & Tricks

### Generate Monthly Reports
1. Select: 1st day of month to last day
2. Download PDF
3. Keep folder: `/My Documents/Farm Reports/2025-01/`
4. Track business performance month-by-month

### Generate Quarterly Reports
For Q1 (Jan-Mar):
- Start Date: 2025-01-01
- End Date: 2025-03-31
- Shows 3-month performance

### Track Seasonal Sales
For harvest season:
- Start Date: Harvest start date
- End Date: Harvest end date
- Compare year-over-year

### Share with Accountant
1. Generate annual report
2. Email PDF to your accountant
3. Use for tax purposes
4. Track deductible expenses (if applicable)

---

## ❓ FAQ

### Q: Can I get reports for dates with no sales?
**A:** Yes! The PDF will show "No sales found for the selected period" but will still generate.

### Q: What if I select wrong dates?
**A:** Just change the dates and download again. No error - just a different report.

### Q: Can I print the PDF?
**A:** Absolutely! Open the PDF and press Ctrl+P to print.

### Q: How do I export to Excel?
**A:** Export the PDF to Excel using:
- Online conversion tool (PDF to Excel)
- Excel "Import" feature
- Or use File > Save As in some PDF readers

### Q: How far back can I generate reports?
**A:** As far back as you've had sales in the system. Default is last 30 days.

### Q: Can I share the PDF link?
**A:** No, PDFs are generated fresh each time. You'll need to download and attach to emails.

### Q: Does the PDF update automatically?
**A:** No. Download a new PDF anytime to get the latest data.

---

## 🔍 Example Scenarios

### Scenario 1: Weekly Check-in
```
Monday Morning:
├─ Start Date: Last Monday
├─ End Date: Yesterday
└─ Download → See sales last week
```

### Scenario 2: Monthly Accounting
```
End of Month:
├─ Start Date: 1st of month
├─ End Date: Today
└─ Download → Email to accountant
```

### Scenario 3: Compare Seasons
```
Q1 vs Q4 Comparison:
├─ Report 1: Jan 1 - Mar 31 (Spring)
├─ Report 2: Oct 1 - Dec 31 (Fall)
└─ Compare sales patterns
```

### Scenario 4: Tax Preparation
```
Annual Report:
├─ Start Date: Jan 1
├─ End Date: Dec 31
└─ Download → Use for tax filing
```

---

## 🚨 Troubleshooting

### Problem: "Please select both start and end dates"
**Solution:** 
- Make sure you've filled in BOTH date fields
- Click on each field to ensure a date is selected

### Problem: PDF download doesn't start
**Solution:**
1. Check browser allows downloads
2. Check internet connection
3. Try different date range
4. Try different browser (Chrome, Firefox, Edge)

### Problem: PDF file is empty or corrupted
**Solution:**
1. Download again
2. Try different date range
3. Check you have sales in that period
4. Contact support if issue persists

### Problem: Wrong filename
**Solution:** 
- Filename is auto-generated from dates
- You can rename after download
- Example rename: `Jan_2025_Sales.pdf`

### Problem: Can't open PDF
**Solution:**
1. Install a PDF reader:
   - Windows: Adobe Reader or Edge
   - Mac: Preview (built-in)
   - Linux: Any PDF reader
2. Or open in web browser (drag and drop)

---

## 🔐 Privacy & Security

### Your Data is Protected:
- ✅ Only you can see your reports
- ✅ Reports only include YOUR sales
- ✅ PDF generated securely on server
- ✅ No one else can access your files
- ✅ Encrypted transmission (HTTPS in production)

### How It Works:
1. You must be logged in as a farmer
2. System verifies your identity (JWT token)
3. Queries ONLY your transactions
4. Generates personalized PDF
5. Downloads directly to your computer

---

## 📊 Using Reports for Business

### Track Performance
- Sales revenue trends
- Product popularity
- Seasonal patterns
- Growth month-over-month

### Manage Finances
- Income tracking
- Tax preparation
- Budget forecasting
- Expense matching

### Plan Production
- What sells best
- When to plant/harvest
- Which products to expand
- Which to discontinue

### Improve Marketing
- Best-selling products
- Peak sales periods
- Customer preferences
- Marketing effectiveness

---

## 🎓 Best Practices

1. **Download Regularly**
   - Weekly for tracking
   - Monthly for accounting
   - Quarterly for analysis

2. **Keep Organized**
   - Create folder: `/Farm Reports/2025/`
   - Name by month: `Sales_Jan_2025.pdf`
   - Backup to cloud (Google Drive, OneDrive)

3. **Share Securely**
   - Email to accountant only
   - Password-protect sensitive PDFs
   - Use secure file sharing

4. **Archive Annually**
   - Create folder: `/Farm Reports/Archive/2024/`
   - Keep for 7 years (tax purposes)
   - Organize by month and year

5. **Monitor Trends**
   - Compare month-to-month
   - Track seasonal changes
   - Set goals based on data

---

## 📞 Support

### If You Need Help:

1. **Check this guide** - Most answers here
2. **Try different dates** - May be no sales in period
3. **Clear browser cache** - Ctrl+Shift+Delete
4. **Try another browser** - Chrome, Firefox, Edge
5. **Contact developer** - If issue persists

### Common Issues Solved:
- ✅ "Both dates required" - Fill in both fields
- ✅ "PDF empty" - May have no sales in period
- ✅ "Download fails" - Try different date range
- ✅ "Can't open PDF" - Install PDF reader
- ✅ "Wrong dates" - Change and download again

---

## 📝 Summary

The **Sales Report** feature gives you powerful tools to:
- 📊 Track sales performance
- 💰 Manage farm finances
- 📈 Plan production
- 📋 Prepare for taxes
- 🎯 Make data-driven decisions

**Start now:** Go to Farmer Dashboard and scroll to "📊 Sales Report"!

---

**Questions?** Check the FAQ or documentation files:
- `QUICK_START.md` - Quick setup guide
- `SALES_REPORT_SUMMARY.md` - Technical summary
- `ARCHITECTURE_DIAGRAM.md` - How it works under the hood

Happy farming! 🌾

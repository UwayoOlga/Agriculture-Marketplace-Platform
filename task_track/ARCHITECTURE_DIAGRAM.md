# 📊 Sales Report Feature - Complete Architecture Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   FARMER DASHBOARD                               │
│  http://localhost:5173/farmer-dashboard                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │  📊 SALES REPORT SECTION (NEW)         │
         │  ──────────────────────────────────    │
         │                                        │
         │  Select Date Range:                    │
         │  ┌──────────────┐  ┌──────────────┐    │
         │  │ Start: 01/01 │  │ End: 01/30   │    │
         │  └──────────────┘  └──────────────┘    │
         │                                        │
         │  [📈 Metrics]  [📥 Download PDF]       │
         │                                        │
         │  ┌─────────────────────────────────┐   │
         │  │ SALES METRICS SUMMARY           │   │
         │  ├─────────────────────────────────┤   │
         │  │ 🔵 Total Sales: RWF 0           │   │
         │  │ 🟢 Products Sold: 0             │   │
         │  │ 🟡 Total Quantity: 0 units      │   │
         │  │ 🔴 Average Price: RWF 0         │   │
         │  └─────────────────────────────────┘   │
         │                                        │
         └────────────────────────────────────────┘
                        ↓ CLICK DOWNLOAD PDF
                        ↓
        ┌────────────────────────────────────┐
        │   API REQUEST TO BACKEND            │
        │   GET /api/farmer/sales-report/     │
        │   ?start_date=2025-01-01            │
        │   &end_date=2025-01-30              │
        │                                    │
        │   Headers:                          │
        │   Authorization: Bearer JWT_TOKEN   │
        │   Content-Type: application/pdf     │
        └────────────────────────────────────┘
                        ↓
        ┌────────────────────────────────────┐
        │   DJANGO BACKEND PROCESSING         │
        │   (SalesReportView)                 │
        │                                    │
        │   1. Verify user authenticated ✓    │
        │   2. Verify user is FARMER ✓        │
        │   3. Parse date params ✓            │
        │   4. Query OrderItems by:           │
        │      - product.farmer_id = user_id  │
        │      - order_date between dates ✓   │
        │   5. Build PDF with reportlab ✓     │
        │      - Green header                 │
        │      - User: farm_name              │
        │      - Period: start to end date    │
        │      - Transaction table:           │
        │        Date | Order# | Product |    │
        │        Qty  | Price  | Subtotal     │
        │      - Total sales amount           │
        │   6. Return PDF as blob response    │
        └────────────────────────────────────┘
                        ↓
        ┌────────────────────────────────────┐
        │   PDF RESPONSE (BINARY)             │
        │                                    │
        │   Response Headers:                 │
        │   Content-Type: application/pdf     │
        │   Content-Disposition: attachment;  │
        │   filename=sales_report_...pdf      │
        │                                    │
        │   Body: [PDF Binary Data]           │
        └────────────────────────────────────┘
                        ↓
        ┌────────────────────────────────────┐
        │   FRONTEND BLOB DOWNLOAD            │
        │   (Browser Download)                │
        │                                    │
        │   1. Receive blob response ✓        │
        │   2. Create blob URL ✓              │
        │   3. Create anchor element ✓        │
        │   4. Set download attribute ✓       │
        │   5. Trigger click() ✓              │
        │   6. Cleanup URL ✓                  │
        └────────────────────────────────────┘
                        ↓
        ┌────────────────────────────────────┐
        │   FILE SAVED TO USER'S COMPUTER     │
        │                                    │
        │   sales_report_2025-01-01_to_      │
        │   2025-01-30.pdf                   │
        │                                    │
        │   📄 Opens in PDF reader            │
        └────────────────────────────────────┘
```

---

## Component Architecture

```
┌──────────────────────────────────────────────────┐
│              FarmerDashboard Component            │
│          (frontend/src/pages/FarmerDashboard.jsx) │
└──────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │     STATE MANAGEMENT              │
        ├───────────────────────────────────┤
        │ reportDateRange: {                │
        │   startDate: string,              │
        │   endDate: string                 │
        │ }                                 │
        │                                   │
        │ salesMetrics: {                   │
        │   totalSales: number,             │
        │   productsSold: number,           │
        │   totalQuantity: number,          │
        │   averagePrice: number,           │
        │   loadingMetrics: boolean,        │
        │   error: string|null              │
        │ }                                 │
        └───────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │      EVENT HANDLERS               │
        ├───────────────────────────────────┤
        │ • handleDateChange()              │
        │   → Updates reportDateRange state │
        │                                   │
        │ • handleFetchSalesMetrics()       │
        │   → Calls /farmer/sales-report/   │
        │   → Updates salesMetrics          │
        │                                   │
        │ • handleDownloadPDF()             │
        │   → Calls /farmer/sales-report/   │
        │   → Triggers blob download        │
        └───────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │      UI SUB-COMPONENTS            │
        ├───────────────────────────────────┤
        │ 1. DateRangeSection               │
        │    • Start Date TextField         │
        │    • End Date TextField           │
        │                                   │
        │ 2. ActionButtonsSection           │
        │    • Fetch Metrics Button         │
        │    • Download PDF Button          │
        │    • Loading indicators           │
        │                                   │
        │ 3. ErrorAlertSection              │
        │    • Shows salesMetrics.error     │
        │                                   │
        │ 4. MetricsCardsSection            │
        │    • 4 Color-coded cards          │
        │    • Total Sales (Blue)           │
        │    • Products Sold (Green)        │
        │    • Total Quantity (Yellow)      │
        │    • Average Price (Pink)         │
        │                                   │
        │ 5. HelpTextSection                │
        │    • Usage tips for users         │
        └───────────────────────────────────┘
```

---

## Data Flow Diagram

```
USER ACTION          FRONTEND STATE           API CALL            BACKEND
──────────────────────────────────────────────────────────────────────────

1. Page Load
   └──────────→ Initialize date range (last 30 days)
                ├── startDate: -30 days
                └── endDate: today

2. User selects
   date range
   └──────────→ updateReportDateRange()
                ├── startDate updated
                └── endDate updated

3. Click Download
   PDF Button
   └──────────→ handleDownloadPDF()
                ├── Validate dates
                ├── Set loading=true
                └──────────────────────→ GET /api/farmer/sales-report/
                                        ?start_date=YYYY-MM-DD
                                        &end_date=YYYY-MM-DD
                                                    ↓
                                            SalesReportView.get()
                                            ├── Check auth ✓
                                            ├── Check is farmer ✓
                                            ├── Parse dates ✓
                                            ├── Query OrderItems ✓
                                            ├── Build PDF ✓
                                            └── Return blob ✓
                                                    ↓
                                        Response: PDF (binary)
                                                    ↓
                   Response handler
                   ├── Set loading=false
                   ├── Create blob URL
                   └── Trigger download

4. PDF Downloads
   └──────────→ User's computer
                └── sales_report_*.pdf

5. Display Metrics
   └──────────→ salesMetrics state
                ├── totalSales: 0
                ├── productsSold: 0
                ├── totalQuantity: 0
                └── averagePrice: 0
                ↓ (Displays in cards)
```

---

## API Endpoint Details

```
┌─────────────────────────────────────────────────────────┐
│ ENDPOINT: GET /api/farmer/sales-report/                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ REQUEST:                                                │
│ ┌──────────────────────────────────────────────────┐   │
│ │ URL: /api/farmer/sales-report/                   │   │
│ │      ?start_date=2025-01-01                      │   │
│ │      &end_date=2025-01-30                        │   │
│ │                                                  │   │
│ │ METHOD: GET                                      │   │
│ │                                                  │   │
│ │ HEADERS:                                         │   │
│ │ Authorization: Bearer <JWT_TOKEN>                │   │
│ │ Content-Type: application/json                   │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ BACKEND PROCESSING:                                     │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 1. Authentication Check                          │   │
│ │    ├── Extract JWT token                         │   │
│ │    ├── Verify token valid                        │   │
│ │    └── Get user object                           │   │
│ │                                                  │   │
│ │ 2. Authorization Check                          │   │
│ │    ├── Check user.user_type == 'FARMER'         │   │
│ │    └── Return 403 if not farmer                  │   │
│ │                                                  │   │
│ │ 3. Date Parsing                                  │   │
│ │    ├── Parse start_date (YYYY-MM-DD)            │   │
│ │    ├── Parse end_date (YYYY-MM-DD)              │   │
│ │    ├── Default to last 30 days if missing       │   │
│ │    └── Validate format                           │   │
│ │                                                  │   │
│ │ 4. Database Query                               │   │
│ │    OrderItem.objects.filter(                     │   │
│ │      product__farmer=request.user,               │   │
│ │      order__order_date__date__gte=start_date,   │   │
│ │      order__order_date__date__lte=end_date      │   │
│ │    ).select_related('order', 'product')          │   │
│ │                                                  │   │
│ │ 5. PDF Generation                               │   │
│ │    ├── Create PDF document                      │   │
│ │    ├── Add title (username)                     │   │
│ │    ├── Add date range                           │   │
│ │    ├── Build transaction table:                 │   │
│ │    │  Date | Order# | Product | Qty | Price    │   │
│ │    ├── Calculate totals                         │   │
│ │    ├── Apply green styling                      │   │
│ │    └── Render to BytesIO buffer                 │   │
│ │                                                  │   │
│ │ 6. Response                                      │   │
│ │    ├── Set Content-Type: application/pdf        │   │
│ │    ├── Set Content-Disposition: attachment      │   │
│ │    └── Return PDF buffer                        │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ RESPONSE:                                               │
│ ┌──────────────────────────────────────────────────┐   │
│ │ STATUS: 200 OK                                   │   │
│ │                                                  │   │
│ │ HEADERS:                                         │   │
│ │ Content-Type: application/pdf                    │   │
│ │ Content-Disposition: attachment;                │   │
│ │   filename=sales_report_username_2025-01-01_    │   │
│ │   2025-01-30.pdf                                │   │
│ │ Content-Length: [file size in bytes]            │   │
│ │                                                  │   │
│ │ BODY:                                            │   │
│ │ [Binary PDF Data]                               │   │
│ │ (PDF file bytes)                                │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ ERROR RESPONSES:                                        │
│ ├── 400 Bad Request (Invalid date format)             │
│ ├── 401 Unauthorized (No valid JWT token)             │
│ ├── 403 Forbidden (Not a farmer user)                 │
│ └── 500 Server Error (PDF generation failed)          │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure Changes

```
BEFORE:
frontend/src/pages/FarmerDashboard.jsx
└── Stats Cards Section
    ├── Total Products
    ├── Orders This Month
    └── Total Revenue
└── Add Product Section
    ├── Product Form
    └── Product List

AFTER:
frontend/src/pages/FarmerDashboard.jsx
└── Stats Cards Section
    ├── Total Products
    ├── Orders This Month
    └── Total Revenue
└── ✨ NEW: Sales Report Section ✨
    ├── Date Range Picker
    │   ├── Start Date Input
    │   └── End Date Input
    ├── Action Buttons
    │   ├── Fetch Metrics Button
    │   └── Download PDF Button
    ├── Error Alert (conditional)
    └── Sales Metrics Cards
        ├── Total Sales Card (Blue)
        ├── Products Sold Card (Green)
        ├── Total Quantity Card (Yellow)
        └── Average Price Card (Pink)
└── Add Product Section (unchanged)
    ├── Product Form
    └── Product List
```

---

## Integration Points

```
1. AUTHENTICATION
   ├─ JWT Token in localStorage (AuthContext)
   ├─ Request interceptor adds Bearer token
   └─ api.get() auto-includes authorization

2. STATE MANAGEMENT
   ├─ React useState hooks
   ├─ useEffect for initialization
   └─ Callbacks for event handling

3. UI COMPONENTS
   ├─ Material-UI (MUI) components
   │  ├─ TextField
   │  ├─ Button
   │  ├─ Card
   │  ├─ Grid
   │  ├─ Typography
   │  ├─ Alert
   │  ├─ CircularProgress
   │  ├─ Divider
   │  └─ Stack
   ├─ MUI Icons
   │  ├─ FileDownloadIcon
   │  └─ AddIcon (existing)
   └─ Ant Design (compatible)

4. API CLIENT
   ├─ axios instance (services/api.js)
   ├─ Custom interceptors
   ├─ Request: JWT injection
   ├─ Response: Error handling
   └─ Download: blob response type

5. NOTIFICATION
   ├─ notistack snackbar
   ├─ Success messages
   ├─ Error messages
   └─ Warning messages

6. ROUTING
   ├─ useNavigate hook
   └─ URL navigation (existing feature)
```

---

## Security Flow

```
1. USER ACTION
   └─ Click Download PDF button

2. FRONTEND VALIDATION
   ├─ Check dates are selected ✓
   ├─ Prepare API request
   └─ Include JWT token (auto-added by interceptor)

3. NETWORK TRANSMISSION
   ├─ HTTPS encrypted (in production)
   ├─ JWT in Authorization header
   └─ Query params in URL

4. BACKEND AUTHENTICATION
   ├─ Extract JWT token from header
   ├─ Verify token signature
   ├─ Check token not expired
   └─ Extract user_id from token claims

5. BACKEND AUTHORIZATION
   ├─ Verify user.user_type == 'FARMER'
   └─ Deny access if not farmer

6. DATA ACCESS
   ├─ Query only OrderItems where:
   │  └─ product.farmer_id == authenticated_user.id
   └─ No cross-farmer data exposure

7. RESPONSE
   ├─ PDF contains only authenticated user's data
   ├─ Sent with auth headers
   └─ Saved to user's computer locally
```

---

## Performance Considerations

```
QUERY OPTIMIZATION:
├─ select_related('order', 'product')
│  └─ Reduces N+1 query problem
├─ Filter on database level
│  └─ Only retrieves relevant records
└─ Index on (product_id, farmer_id)
   └─ Speeds up filter operations

PDF GENERATION:
├─ Generated on-demand (not cached)
├─ BytesIO buffer (memory-based, not disk)
├─ reportlab streaming
└─ Typical: <1 second generation

NETWORK:
├─ Blob download (efficient transfer)
├─ Browser-native download (no intermediate storage)
└─ Content-Disposition: attachment (safe download)

FRONTEND:
├─ Minimal state updates
├─ Loading indicators (user feedback)
├─ Blob URL cleanup (memory management)
└─ Responsive layout (no layout thrashing)
```

---

This comprehensive architecture ensures:
✅ Security (JWT auth + farmer verification)
✅ Performance (optimized queries + streaming PDF)
✅ User Experience (loading states + error handling)
✅ Scalability (stateless API design)
✅ Maintainability (clear separation of concerns)

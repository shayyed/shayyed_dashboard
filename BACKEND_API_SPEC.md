# Shayyed Admin Dashboard - Comprehensive Backend API Specification

**Purpose:** Complete specification for backend development. Use this document to build all APIs and services for integration with the Shayyed admin dashboard.

**Generated from:** `/Users/kay/FULLSTACK/shayyed/shayyedDashboard`  
**Date:** February 21, 2026

**Authentication:** All admin endpoints require `Authorization: Bearer <admin_token>` header. Admin authentication is separate from the mobile app user auth.

---

## Table of Contents

1. [Admin Authentication](#1-admin-authentication)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Users Management](#3-users-management)
4. [Requests](#4-requests)
5. [Quotations](#5-quotations)
6. [Contracts](#6-contracts)
7. [Projects](#7-projects)
8. [Invoices](#8-invoices)
9. [Payments](#9-payments)
10. [Settlements](#10-settlements)
11. [Complaints](#11-complaints)
12. [Support Tickets](#12-support-tickets)
13. [Chat Management](#13-chat-management)
14. [Notifications](#14-notifications)
15. [Milestones](#15-milestones)
16. [Services Catalog (CRUD)](#16-services-catalog-crud)
17. [Promo Codes](#17-promo-codes)
18. [Contractor Verification](#18-contractor-verification)
19. [ZATCA Integration](#19-zatca-integration)
20. [Zoho Integration](#20-zoho-integration)
21. [Settings](#21-settings)
22. [Business Intelligence (BI)](#22-business-intelligence-bi)
23. [Audit Logs](#23-audit-logs)
24. [Locations](#24-locations)
25. [Complete Type Definitions](#25-complete-type-definitions)
26. [API Endpoint Summary](#26-api-endpoint-summary)
27. [Error Handling & HTTP Status Codes](#27-error-handling--http-status-codes)
28. [Implementation Priority](#28-implementation-priority)

---

## 1. Admin Authentication

### 1.1 Admin Login Flow

The dashboard is accessed by admin users. Admin authentication is separate from client/contractor auth.

- Admin logs in with email/password or similar credentials
- Backend returns admin token for subsequent API calls
- Token is sent in `Authorization: Bearer <token>` header for all admin endpoints

### 1.2 API Endpoints

#### POST `/admin/auth/login`
**Request:**
```json
{
  "email": "admin@shayyed.sa",
  "password": "string"
}
```
**Response:**
```json
{
  "admin": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "admin"
  },
  "token": "string",
  "expiresAt": "ISO8601"
}
```

#### POST `/admin/auth/logout`
**Request:** Bearer token in header  
**Response:** `void`

#### GET `/admin/auth/me`
**Request:** Bearer token in header  
**Response:** Current admin profile

---

## 2. Dashboard Overview

### 2.1 Dashboard Stats

The main dashboard (`/`) displays aggregated statistics. These can be computed from existing list endpoints or provided by a dedicated stats endpoint.

**Data needed:**
- Total users (clients + contractors)
- Total clients
- Total contractors
- Total requests (regular + quick)
- Total regular requests
- Total quick service orders
- Total accepted requests
- Total paid invoices
- Total pending invoices
- Total open complaints
- Total open support tickets

**Optional dedicated endpoint:**

#### GET `/admin/dashboard/stats`
**Response:**
```json
{
  "totalUsers": 0,
  "totalClients": 0,
  "totalContractors": 0,
  "totalRequests": 0,
  "totalRegularRequests": 0,
  "totalQuickServiceOrders": 0,
  "totalAcceptedRequests": 0,
  "totalPaidInvoices": 0,
  "totalPendingInvoices": 0,
  "totalOpenComplaints": 0,
  "totalOpenSupportTickets": 0
}
```

**Recent items (last 5 each):**
- Recent requests (regular + quick, sorted by createdAt desc)
- Recent complaints
- Recent support tickets
- Recent paid invoices

These can be fetched via list endpoints with `limit=5` and `sort=createdAt:desc`.

---

## 3. Users Management

### 3.1 List Users

#### GET `/admin/users`
**Query params:**
- `role` (optional): `CLIENT` | `CONTRACTOR` — filter by role
- `search` (optional): search by name, id, phone, email
- `registrationDateFrom` (optional): YYYY-MM-DD
- `registrationDateTo` (optional): YYYY-MM-DD
- `page` (optional): default 1
- `limit` (optional): default 20

**Response:** `User[]`

### 3.2 List Contractors (with extended filters)

#### GET `/admin/contractors`
**Query params:**
- `search` (optional): name, id, phone, companyName, commercialRegistration
- `verificationStatus` (optional): `PENDING` | `VERIFIED` | `REJECTED`
- `ratingMin` (optional): 1.0–5.0
- `ratingMax` (optional): 1.0–5.0
- `registrationDateFrom` (optional): YYYY-MM-DD
- `registrationDateTo` (optional): YYYY-MM-DD
- `city` (optional): filter by coverage area
- `page`, `limit`

**Response:** `ContractorProfile[]`

### 3.3 Get User / Client / Contractor

#### GET `/admin/users/:id`
**Response:** `User | null`

#### GET `/admin/clients/:id`
**Response:** `ClientProfile | null` — includes addresses

#### GET `/admin/contractors/:id`
**Response:** `ContractorProfile | null`

### 3.4 Client Extended Data

#### GET `/admin/clients/:id/payment-methods`
**Response:** `PaymentMethod[]`

#### GET `/admin/contractors/:id/ratings`
**Response:** `Rating[]`

#### GET `/admin/contractors/:id/portfolio`
**Response:** `PortfolioItem[]`

### 3.5 User Toggle Active (optional)

#### PUT `/admin/users/:id/active`
**Request:** `{ "isActive": boolean }`  
**Response:** Updated user

---

## 4. Requests

### 4.1 List Requests

#### GET `/admin/requests`
**Query params:**
- `type` (optional): `regular` | `quick`
- `status` (optional): RequestStatus or QuickServiceOrderStatus
- `clientId`, `contractorId` (optional)
- `search` (optional)
- `page`, `limit`

**Response:** `ServiceRequest[]` or `QuickServiceOrder[]` depending on type, or combined with `type` field

### 4.2 List Regular Requests

#### GET `/admin/requests/regular`
**Response:** `ServiceRequest[]`

### 4.3 List Quick Service Orders

#### GET `/admin/requests/quick`
**Response:** `QuickServiceOrder[]`

### 4.4 Get Request Details

#### GET `/admin/requests/regular/:id`
**Response:** `ServiceRequest | null`

#### GET `/admin/requests/quick/:id`
**Response:** `QuickServiceOrder | null`

---

## 5. Quotations

### 5.1 List Quotations

#### GET `/admin/quotations`
**Query params:**
- `requestId`, `contractorId`, `status`
- `page`, `limit`

**Response:** `Quotation[]`

### 5.2 Get Quotation

#### GET `/admin/quotations/:id`
**Response:** `Quotation | null`

---

## 6. Contracts

### 6.1 List Contracts

#### GET `/admin/contracts`
**Query params:**
- `clientId`, `contractorId`, `requestId`, `status`
- `page`, `limit`

**Response:** `Contract[]`

### 6.2 Get Contract

#### GET `/admin/contracts/:id`
**Response:** `Contract | null`

---

## 7. Projects

### 7.1 List Projects

#### GET `/admin/projects`
**Query params:**
- `clientId`, `contractorId`, `status`
- `page`, `limit`

**Response:** `Project[]`

### 7.2 Get Project

#### GET `/admin/projects/:id`
**Response:** `Project | null`

### 7.3 Project Timeline

#### GET `/admin/projects/:id/timeline`
**Response:** `TimelineEntry[]`

```typescript
interface TimelineEntry {
  id: string;
  projectId: string;
  content: string;
  attachment?: string;
  createdAt: string;
}
```

---

## 8. Invoices

### 8.1 List Invoices

#### GET `/admin/invoices`
**Query params:**
- `projectId`, `contractorId`, `clientId`
- `status`, `zatcaStatus`
- `amountMin`, `amountMax`
- `dueDateFrom`, `dueDateTo`
- `createdAtFrom`, `createdAtTo`
- `paidAtFrom`, `paidAtTo`
- `page`, `limit`

**Response:** `Invoice[]`

### 8.2 Get Invoice

#### GET `/admin/invoices/:id`
**Response:** `Invoice | null`

---

## 9. Payments

### 9.1 List Payments

#### GET `/admin/payments`
**Query params:**
- `invoiceId`, `status`
- `page`, `limit`

**Response:** `Payment[]`

### 9.2 Get Payment

#### GET `/admin/payments/:id`
**Response:** `Payment | null`

---

## 10. Settlements

### 10.1 Settlement Status Flow

- **Pending** → Admin clicks "بدء المعالجة" → **Processing**
- **Processing** → Admin clicks "تأكيد التحويل" → **Paid**
- **Pending** or **Processing** → Admin clicks "رفض" (with reason) → **Rejected**

### 10.2 List Settlements

#### GET `/admin/settlements`
**Query params:**
- `status`: `Pending` | `Processing` | `Paid` | `Rejected`
- `contractorId`, `contractorName` (search)
- `periodFrom`, `periodTo` (YYYY-MM-DD)
- `page`, `limit`

**Response:** `Settlement[]`

### 10.3 Update Settlement Status

#### PUT `/admin/settlements/:id/status`
**Request:**
```json
{
  "status": "Processing" | "Paid" | "Rejected",
  "rejectReason": "string"  // Required when status = Rejected
}
```
**Response:** Updated `Settlement`

**Validation:**
- When `status` = `Rejected`, `rejectReason` is required
- When `status` = `Paid`, backend should set `processedAt` (or equivalent)

### 10.4 Settlement Details

Settlement includes:
- `id`, `contractorId`, `contractorName`
- `periodStart`, `periodEnd`
- `grossAmount`, `platformFee`, `vatAmount`, `netPayout`
- `status`: `Pending` | `Processing` | `Paid` | `Rejected`
- `createdAt`, `processedAt` (optional)
- `rejectReason` (optional, when Rejected)

### 10.5 Download Settlement Report

#### GET `/admin/settlements/:id/report`
**Response:** PDF or Excel file (Content-Disposition: attachment)

---

## 11. Complaints

### 11.1 List Complaints

#### GET `/admin/complaints`
**Query params:**
- `status`, `type`, `projectId`, `clientId`, `contractorId`
- `page`, `limit`

**Response:** `Complaint[]`

### 11.2 Get Complaint

#### GET `/admin/complaints/:id`
**Response:** `Complaint | null`

### 11.3 Admin Respond to Complaint

#### PUT `/admin/complaints/:id/respond`
**Request:**
```json
{
  "response": "string"  // Admin response text, required
}
```
**Response:** Updated `Complaint`

**Behavior:**
- Sets `response`, `respondedAt`, `respondedBy` (admin ID)
- Updates `status` to `IN_REVIEW` (or `RESOLVED` depending on business logic)
- Sends notification to complainant (client or contractor who raised the complaint)

---

## 12. Support Tickets

### 12.1 List Support Tickets

#### GET `/admin/support-tickets`
**Query params:**
- `status`: `open` | `in_progress` | `closed`
- `userId`, `role`
- `page`, `limit`

**Response:** `SupportTicket[]`

### 12.2 Get Support Ticket

#### GET `/admin/support-tickets/:id`
**Response:** `SupportTicket | null` (includes `replies`)

### 12.3 Admin Reply to Support Ticket

#### POST `/admin/support-tickets/:id/replies`
**Request:**
```json
{
  "content": "string",   // Required
  "attachments": ["url1", "url2"]  // Optional
}
```
**Response:** `SupportTicketReply`

**Behavior:**
- Creates reply with `senderRole: 'support'`, `senderId` = admin ID
- Updates ticket `status` to `in_progress` if it was `open`
- Updates ticket `updatedAt`
- Sends notification to ticket creator

---

## 13. Chat Management

### 13.1 List Chat Threads

#### GET `/admin/chat/threads`
**Query params:**
- `clientId`, `contractorId`
- `relatedType`: `request` | `project` | `invoice`
- `relatedId`
- `page`, `limit`

**Response:** `ChatThread[]`

### 13.2 Get Chat Thread

#### GET `/admin/chat/threads/:id`
**Response:** `ChatThread | null`

### 13.3 List Chat Messages

#### GET `/admin/chat/threads/:id/messages`
**Query params:**
- `page`, `limit`

**Response:** `ChatMessage[]`

### 13.4 Chat Settings (Dashboard-specific)

The dashboard has a Chat Settings page (`/chats/settings`) with three toggles. These must be stored in backend and applied by the chat service.

#### GET `/admin/chat/settings`
**Response:**
```json
{
  "hideChatDuringOffers": boolean,
  "hideChatAfterAward": boolean,
  "disableChatCompletely": boolean
}
```

#### PUT `/admin/chat/settings`
**Request:**
```json
{
  "hideChatDuringOffers": boolean,
  "hideChatAfterAward": boolean,
  "disableChatCompletely": boolean
}
```
**Response:** Updated settings

**Semantics:**
- `hideChatDuringOffers`: Hide chat button for client and contractor during quotation phase
- `hideChatAfterAward`: Hide chat button after project is awarded
- `disableChatCompletely`: Disable all chat between clients and contractors

### 13.5 Chat Bans (Dashboard-specific)

Admin can ban specific client–contractor pairs from chatting.

#### GET `/admin/chat/bans`
**Response:** `ChatBan[]`

```typescript
interface ChatBan {
  id: string;
  clientId: string;
  contractorId: string;
  bannedAt: string;
}
```

#### POST `/admin/chat/bans`
**Request:**
```json
{
  "clientId": "string",
  "contractorId": "string"
}
```
**Response:** `ChatBan`

**Validation:** No duplicate (clientId, contractorId) or reverse pair

#### DELETE `/admin/chat/bans/:id`
**Response:** `void`

---

## 14. Notifications

### 14.1 List Notifications

#### GET `/admin/notifications`
**Query params:**
- `search` (title, body)
- `userId`, `type`
- `page`, `limit`

**Response:** `Notification[]`

### 14.2 Get Notification

#### GET `/admin/notifications/:id`
**Response:** `Notification | null`

### 14.3 Broadcast Notification

#### POST `/admin/notifications/broadcast`
**Request:**
```json
{
  "title": "string",
  "body": "string",
  "type": "offer" | "payment" | "complaint" | "general",
  "targetType": "all" | "clients" | "contractors"
}
```
**Response:** `{ "success": true, "sentCount": number }`

**Behavior:**
- Creates and sends notifications to all users matching `targetType`
- `targetType`: `all` = all users, `clients` = clients only, `contractors` = contractors only

---

## 15. Milestones

### 15.1 List Milestones

#### GET `/admin/milestones`
**Query params:**
- `projectId`, `contractId`, `status`
- `dueDateFrom`, `dueDateTo`
- `page`, `limit`

**Response:** `Milestone[]`

### 15.2 Get Milestone

#### GET `/admin/milestones/:id`
**Response:** `Milestone | null`

### 15.3 Get Milestone Contract

#### GET `/admin/milestones/:id/contract`
**Response:** `Contract | null` — contract that contains this milestone

---

## 16. Services Catalog (CRUD)

The dashboard has full CRUD for:
- **Regular services:** ServiceGroup (top-level) → Category (under group) → Subcategory (under category)
- **Quick services:** QuickService (standalone)

### 16.1 Service Groups (Regular Services - Top Level)

#### GET `/admin/services/groups`
**Response:** `ServiceGroup[]`

#### GET `/admin/services/groups/:id`
**Response:** `ServiceGroup | null` (includes `categories`)

#### POST `/admin/services/groups`
**Request:**
```json
{
  "name": "string",
  "description": "string",
  "icon": "string",
  "displayOrder": number,
  "isActive": boolean
}
```
**Response:** `ServiceGroup`

#### PUT `/admin/services/groups/:id`
**Request:** Same as POST (partial update)  
**Response:** `ServiceGroup`

#### DELETE `/admin/services/groups/:id`
**Response:** `void` — Consider soft delete or cascade rules

### 16.2 Categories (Under Service Group)

#### GET `/admin/services/categories`
**Query params:** `groupId`  
**Response:** `Category[]`

#### GET `/admin/services/categories/:id`
**Response:** `Category | null` (includes `subcategories`)

#### POST `/admin/services/categories`
**Request:**
```json
{
  "name": "string",
  "groupId": "string",
  "displayOrder": number,
  "isActive": boolean
}
```
**Response:** `Category`

#### PUT `/admin/services/categories/:id`
**Request:** Partial update  
**Response:** `Category`

#### PUT `/admin/services/categories/:id/toggle-active`
**Request:** `{ "isActive": boolean }`  
**Response:** `Category`  
**Note:** When disabling category, disable all its subcategories

### 16.3 Subcategories (Under Category)

#### GET `/admin/services/subcategories`
**Query params:** `categoryId`, `groupId`  
**Response:** `Subcategory[]`

#### GET `/admin/services/subcategories/:id`
**Response:** `Subcategory | null`

#### POST `/admin/services/subcategories`
**Request:**
```json
{
  "name": "string",
  "description": "string",
  "categoryId": "string",
  "icon": "string",
  "displayOrder": number,
  "isActive": boolean
}
```
**Response:** `Subcategory`

#### PUT `/admin/services/subcategories/:id`
**Request:** Partial update  
**Response:** `Subcategory`

#### PUT `/admin/services/subcategories/:id/toggle-active`
**Request:** `{ "isActive": boolean }`  
**Response:** `Subcategory`  
**Note:** Cannot enable if parent category is disabled

### 16.4 Quick Services

#### GET `/admin/services/quick`
**Response:** `QuickService[]`

#### GET `/admin/services/quick/:id`
**Response:** `QuickService | null`

#### POST `/admin/services/quick`
**Request:**
```json
{
  "title": "string",
  "price": number,
  "duration": "string",
  "description": "string",
  "icon": "string",
  "displayOrder": number,
  "isActive": boolean
}
```
**Response:** `QuickService`

#### PUT `/admin/services/quick/:id`
**Request:** Partial update  
**Response:** `QuickService`

#### PUT `/admin/services/quick/:id/toggle-active`
**Request:** `{ "isActive": boolean }`  
**Response:** `QuickService`

---

## 17. Promo Codes

### 17.1 List Promo Codes

#### GET `/admin/promo-codes`
**Query params:**
- `isActive` (boolean)
- `search` (title, code)
- `page`, `limit`

**Response:** `PromoCode[]`

```typescript
interface PromoCode {
  id: string;
  title: string;
  code: string;
  discountRate: number;  // 1-100
  isActive: boolean;
  createdAt: string;
}
```

### 17.2 Create Promo Code

#### POST `/admin/promo-codes`
**Request:**
```json
{
  "title": "string",
  "code": "string",
  "discountRate": number
}
```
**Response:** `PromoCode`

**Validation:**
- `title`: required
- `code`: required, unique, case-insensitive
- `discountRate`: 1–100

### 17.3 Toggle Promo Code Active

#### PUT `/admin/promo-codes/:id/toggle-active`
**Request:** `{ "isActive": boolean }`  
**Response:** `PromoCode`

---

## 18. Contractor Verification

### 18.1 Verify Contractor

#### PUT `/admin/contractors/:id/verification`
**Request:**
```json
{
  "status": "VERIFIED" | "REJECTED",
  "rejectReason": "string"  // Required when status = REJECTED
}
```
**Response:** Updated `ContractorProfile`

**Behavior:**
- `VERIFIED`: Sets `verificationStatus`, `verifiedAt`, clears `rejectionReason` if any
- `REJECTED`: Sets `verificationStatus`, `rejectedAt`, `verificationNotes` (or `rejectReason`), notifies contractor

---

## 19. ZATCA Integration

### 19.1 List Invoices (ZATCA View)

Uses same `GET /admin/invoices` with `zatcaStatus` filter. ZATCA page shows:
- Count by status: NOT_ISSUED, PENDING, ISSUED, REJECTED
- Table with: id, projectId, contractorId, zatcaStatus, zatcaUUID, zatcaIssuedAt

### 19.2 Invoice ZATCA Fields

```typescript
// Invoice extension for ZATCA
zatcaStatus: 'NOT_ISSUED' | 'PENDING' | 'ISSUED' | 'REJECTED';
zatcaUUID?: string;
zatcaIssuedAt?: string;  // ISO8601, when status = ISSUED
```

### 19.3 Issue ZATCA (Trigger Issuance)

#### POST `/admin/invoices/:id/zatca/issue`
**Response:** Updated `Invoice` (zatcaStatus may become PENDING, then ISSUED or REJECTED)

**Behavior:**
- Triggers ZATCA submission for invoice
- Backend calls ZATCA API, updates zatcaStatus, zatcaUUID, zatcaIssuedAt on success

### 19.4 Retry ZATCA (PENDING → retry)

#### POST `/admin/invoices/:id/zatca/retry`
**Response:** Updated `Invoice`

**Behavior:** Retry ZATCA submission when status is PENDING (e.g. previous attempt failed)

### 19.5 View ZATCA XML

#### GET `/admin/invoices/:id/zatca/xml`
**Response:** XML content (Content-Type: application/xml) or JSON `{ "xml": "string" }`

---

## 20. Zoho Integration

### 20.1 Invoice Zoho Fields

```typescript
// Invoice
zohoId?: string;  // Zoho invoice ID when synced
```

### 20.2 Sync Invoice to Zoho

#### POST `/admin/invoices/:id/zoho/sync`
**Response:** Updated `Invoice` with `zohoId`

**Behavior:** Creates/updates invoice in Zoho, stores zohoId

### 20.3 Resync Invoice to Zoho

#### POST `/admin/invoices/:id/zoho/resync`
**Response:** Updated `Invoice`

**Behavior:** Re-syncs invoice data to Zoho (for already synced invoices)

---

## 21. Settings

### 21.1 Get Settings

#### GET `/admin/settings`
**Response:**
```json
{
  "appName": "string",
  "appLogo": "string",
  "appDescription": "string",
  "contactInfo": {
    "phone": "string",
    "email": "string",
    "address": "string"
  },
  "workingHours": {
    "from": "string",
    "to": "string",
    "days": ["string"]
  },
  "commissionFee": number,
  "vatPercentage": number,
  "paymentMethods": ["card", "mada", "apple_pay"],
  "noonPayment": {
    "apiKey": "string",
    "apiSecret": "string",
    "environment": "sandbox" | "production"
  },
  "zatca": {
    "endpoint": "string",
    "credentials": "string",
    "autoIssue": boolean
  },
  "notifications": {
    "enabled": boolean,
    "pushEnabled": boolean
  },
  "termsAndConditions": {
    "content": "string",
    "lastUpdated": "string"
  },
  "privacyPolicy": {
    "content": "string",
    "lastUpdated": "string"
  }
}
```

### 21.2 Update Settings

#### PUT `/admin/settings`
**Request:** Partial object of settings  
**Response:** Updated settings

---

## 22. Business Intelligence (BI)

### 22.1 BI Stats Endpoint

The BI page (`/bi`) shows aggregated stats for a date range. Stats are computed from existing data filtered by `fromDate` and `toDate`.

#### GET `/admin/bi/stats`
**Query params:**
- `fromDate`: YYYY-MM-DD (required)
- `toDate`: YYYY-MM-DD (required)

**Response:**
```json
{
  "totalUsers": number,
  "totalClients": number,
  "totalContractors": number,
  "newUsers": number,
  "totalRequests": number,
  "totalRegularRequests": number,
  "totalQuickServiceOrders": number,
  "acceptedRequests": number,
  "pendingRequests": number,
  "totalQuotations": number,
  "acceptedQuotations": number,
  "pendingQuotations": number,
  "totalContracts": number,
  "activeContracts": number,
  "completedContracts": number,
  "totalProjects": number,
  "activeProjects": number,
  "completedProjects": number,
  "totalRevenue": number,
  "totalInvoices": number,
  "paidInvoices": number,
  "pendingInvoices": number,
  "totalPayments": number,
  "totalMilestones": number,
  "paidMilestones": number,
  "totalComplaints": number,
  "openComplaints": number,
  "resolvedComplaints": number,
  "totalSupportTickets": number,
  "openSupportTickets": number,
  "resolvedSupportTickets": number,
  "totalChats": number,
  "totalNotifications": number
}
```

**Filtering logic:**
- Users: `createdAt` in range
- Requests/Orders: `createdAt` in range
- Quotations: `createdAt` in range
- Contracts: `createdAt` in range
- Projects: `createdAt` in range
- Invoices: `createdAt` in range
- Payments: `createdAt` in range
- Milestones: `dueDate` in range
- Complaints: `createdAt` in range
- Support tickets: `createdAt` in range
- Chats: `updatedAt` or `createdAt` in range
- Notifications: `createdAt` in range

---

## 23. Audit Logs

### 23.1 List Audit Logs

#### GET `/admin/audit-logs`
**Query params:**
- `adminId`, `entityType`, `entityId`
- `actionType`: `CREATE` | `UPDATE` | `DELETE` | `STATUS_CHANGE`
- `fromDate`, `toDate`
- `page`, `limit`

**Response:** `AuditLog[]`

### 23.2 Get Audit Log

#### GET `/admin/audit-logs/:id`
**Response:** `AuditLog | null`

### 23.3 Audit Log Structure

```typescript
interface AuditLog {
  id: string;
  adminId: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  entityType: string;
  entityId: string;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  diff?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
```

---

## 24. Locations

### 24.1 List Cities

#### GET `/admin/locations/cities`
**Response:** `{ id: string; name: string; districts?: District[] }[]`

### 24.2 List Districts

#### GET `/admin/locations/districts`
**Query params:** `cityId` (optional)  
**Response:** `{ id: string; cityId: string; name: string }[]`

---

## 25. Complete Type Definitions

### Enums

```typescript
enum UserRole {
  CLIENT = 'CLIENT',
  CONTRACTOR = 'CONTRACTOR',
}

enum RequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CANCELLED = 'CANCELLED',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
}

enum QuotationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

enum ComplaintType {
  DELAY = 'DELAY',
  QUALITY = 'QUALITY',
  SCOPE = 'SCOPE',
  PAYMENT = 'PAYMENT',
  OTHER = 'OTHER',
}

enum ComplaintStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

enum ZATCAStatus {
  NOT_ISSUED = 'NOT_ISSUED',
  PENDING = 'PENDING',
  ISSUED = 'ISSUED',
  REJECTED = 'REJECTED',
}

enum QuickServiceOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
```

### Core Interfaces

```typescript
interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: string;
}

interface Address {
  id: string;
  city: string;
  district: string;
  detailed?: string;
  isDefault: boolean;
}

interface ClientProfile extends User {
  role: UserRole.CLIENT;
  addresses?: Address[];
}

interface ContractorProfile extends User {
  role: UserRole.CONTRACTOR;
  companyName?: string;
  rating: number;
  totalRatings?: number;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  rejectedAt?: string;
  verificationNotes?: string;
  services: string[];
  coverageAreas: string[];
  coverageAreasWithDistricts?: { city: string; districts: string[] }[];
  portfolio?: string[];
  companyDescription?: string;
  commercialRegistration?: string;
  taxId?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

interface ServiceRequest {
  id: string;
  clientId: string;
  serviceId: string;
  serviceName: string;
  title: string;
  description: string;
  urgency: 'normal' | 'urgent';
  hasDesign?: boolean;
  requirements: string[];
  location: { city: string; district: string; detailed?: string };
  budgetRange: string;
  materialsIncluded?: boolean;
  startDate?: string;
  expectedDuration?: string;
  allowSiteVisits: boolean;
  attachments: string[];
  notes?: string;
  status: RequestStatus;
  rating?: number;
  offersCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface QuickServiceOrder {
  id: string;
  clientId: string;
  serviceId: string;
  serviceTitle: string;
  title?: string;
  description?: string;
  urgency?: 'normal' | 'urgent';
  attachments?: string[];
  price: number;
  duration: string;
  location: { city: string; district: string; detailed?: string };
  materialsIncluded?: boolean;
  scheduledDate?: string;
  status: QuickServiceOrderStatus;
  contractorId?: string;
  contractorName?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

interface Quotation {
  id: string;
  requestId: string;
  contractorId: string;
  contractorName: string;
  contractorRating: number;
  price: number;
  duration: number | string;
  materialsIncluded: boolean;
  materialsDetails?: string;
  notes?: string;
  additionalTerms?: string;
  installments?: Array<{ id: string; title: string; amount: number; description: string; dueDate?: string }>;
  executionPhases?: Array<{ id: string; title: string; duration: number; description: string; linkedInstallmentId?: string }>;
  attachments: string[];
  status: QuotationStatus;
  createdAt: string;
}

interface Milestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  status: 'NotDue' | 'Due' | 'Paid';
  dueDate?: string;
  paidAt?: string;
  description?: string;
}

interface Contract {
  id: string;
  requestId: string;
  quotationId: string;
  clientId: string;
  contractorId: string;
  scope: string;
  totalPrice: number;
  duration: number;
  milestones: Milestone[];
  createdAt: string;
}

interface Project {
  id: string;
  contractId: string;
  requestId: string;
  clientId: string;
  contractorId: string;
  title: string;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: string;
  projectId: string;
  contractorId: string;
  clientId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  zatcaStatus: ZATCAStatus;
  zatcaUUID?: string;
  zatcaIssuedAt?: string;
  zohoId?: string;
  attachments: string[];
  createdAt: string;
  paidAt?: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  referenceNumber?: string;
  noonPaymentId?: string;
  noonReference?: string;
  processedAt?: string;
  successAt?: string;
  failedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  refundedBy?: string;
  createdAt: string;
}

interface Settlement {
  id: string;
  contractorId: string;
  contractorName: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  platformFee: number;
  vatAmount: number;
  netPayout: number;
  status: 'Pending' | 'Processing' | 'Paid' | 'Rejected';
  createdAt: string;
  processedAt?: string;
  rejectReason?: string;
}

interface Complaint {
  id: string;
  projectId: string;
  clientId: string;
  contractorId: string;
  raisedBy: 'CLIENT' | 'CONTRACTOR';
  type: ComplaintType;
  description: string;
  attachments: string[];
  status: ComplaintStatus;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
}

interface ChatThread {
  id: string;
  clientId: string;
  contractorId: string;
  relatedType: 'request' | 'project' | 'invoice';
  relatedId: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  attachments?: string[];
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'offer' | 'payment' | 'complaint' | 'general';
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  description: string;
  attachments: string[];
  status: 'open' | 'in_progress' | 'closed';
  replies?: SupportTicketReply[];
  createdAt: string;
  updatedAt: string;
}

interface SupportTicketReply {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'user' | 'support';
  content: string;
  attachments?: string[];
  createdAt: string;
}

interface ServiceGroup {
  id: string;
  name: string;
  description: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  categories?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  groupId: string;
  displayOrder?: number;
  isActive?: boolean;
  subcategories?: Subcategory[];
  createdAt?: string;
  updatedAt?: string;
}

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface QuickService {
  id: string;
  title: string;
  price: number;
  duration: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'mada' | 'apple_pay';
  last4Digits?: string;
  createdAt: string;
}

interface Rating {
  id: string;
  projectId?: string;
  requestId?: string;
  contractorId: string;
  clientId: string;
  rating: number;
  tags?: string[];
  comment?: string;
  createdAt: string;
}

interface PortfolioItem {
  id: string;
  imageUri: string;
  title: string;
  description: string;
  date: string;
  city: string;
  contractorId?: string;
}
```

---

## 26. API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /admin/auth/login | Admin login |
| POST | /admin/auth/logout | Admin logout |
| GET | /admin/auth/me | Current admin |
| GET | /admin/dashboard/stats | Dashboard stats (optional) |
| GET | /admin/users | List users |
| GET | /admin/users/:id | Get user |
| GET | /admin/clients/:id | Get client |
| GET | /admin/clients/:id/payment-methods | Client payment methods |
| GET | /admin/contractors | List contractors |
| GET | /admin/contractors/:id | Get contractor |
| GET | /admin/contractors/:id/ratings | Contractor ratings |
| GET | /admin/contractors/:id/portfolio | Contractor portfolio |
| PUT | /admin/contractors/:id/verification | Verify/reject contractor |
| GET | /admin/requests/regular | List regular requests |
| GET | /admin/requests/quick | List quick orders |
| GET | /admin/requests/regular/:id | Get regular request |
| GET | /admin/requests/quick/:id | Get quick order |
| GET | /admin/quotations | List quotations |
| GET | /admin/quotations/:id | Get quotation |
| GET | /admin/contracts | List contracts |
| GET | /admin/contracts/:id | Get contract |
| GET | /admin/projects | List projects |
| GET | /admin/projects/:id | Get project |
| GET | /admin/projects/:id/timeline | Project timeline |
| GET | /admin/invoices | List invoices |
| GET | /admin/invoices/:id | Get invoice |
| POST | /admin/invoices/:id/zatca/issue | Issue ZATCA |
| POST | /admin/invoices/:id/zatca/retry | Retry ZATCA |
| GET | /admin/invoices/:id/zatca/xml | Get ZATCA XML |
| POST | /admin/invoices/:id/zoho/sync | Sync to Zoho |
| POST | /admin/invoices/:id/zoho/resync | Resync to Zoho |
| GET | /admin/payments | List payments |
| GET | /admin/payments/:id | Get payment |
| GET | /admin/settlements | List settlements |
| PUT | /admin/settlements/:id/status | Update settlement status |
| GET | /admin/settlements/:id/report | Download settlement report |
| GET | /admin/complaints | List complaints |
| GET | /admin/complaints/:id | Get complaint |
| PUT | /admin/complaints/:id/respond | Admin respond |
| GET | /admin/support-tickets | List support tickets |
| GET | /admin/support-tickets/:id | Get ticket |
| POST | /admin/support-tickets/:id/replies | Admin reply |
| GET | /admin/chat/threads | List chat threads |
| GET | /admin/chat/threads/:id | Get thread |
| GET | /admin/chat/threads/:id/messages | List messages |
| GET | /admin/chat/settings | Get chat settings |
| PUT | /admin/chat/settings | Update chat settings |
| GET | /admin/chat/bans | List chat bans |
| POST | /admin/chat/bans | Add ban |
| DELETE | /admin/chat/bans/:id | Remove ban |
| GET | /admin/notifications | List notifications |
| GET | /admin/notifications/:id | Get notification |
| POST | /admin/notifications/broadcast | Broadcast notification |
| GET | /admin/milestones | List milestones |
| GET | /admin/milestones/:id | Get milestone |
| GET | /admin/milestones/:id/contract | Get milestone contract |
| GET | /admin/services/groups | List service groups |
| GET | /admin/services/groups/:id | Get group |
| POST | /admin/services/groups | Create group |
| PUT | /admin/services/groups/:id | Update group |
| GET | /admin/services/categories | List categories |
| GET | /admin/services/categories/:id | Get category |
| POST | /admin/services/categories | Create category |
| PUT | /admin/services/categories/:id | Update category |
| GET | /admin/services/subcategories | List subcategories |
| GET | /admin/services/subcategories/:id | Get subcategory |
| POST | /admin/services/subcategories | Create subcategory |
| PUT | /admin/services/subcategories/:id | Update subcategory |
| GET | /admin/services/quick | List quick services |
| GET | /admin/services/quick/:id | Get quick service |
| POST | /admin/services/quick | Create quick service |
| PUT | /admin/services/quick/:id | Update quick service |
| GET | /admin/promo-codes | List promo codes |
| POST | /admin/promo-codes | Create promo code |
| PUT | /admin/promo-codes/:id/toggle-active | Toggle promo active |
| GET | /admin/settings | Get settings |
| PUT | /admin/settings | Update settings |
| GET | /admin/bi/stats | BI stats by date range |
| GET | /admin/audit-logs | List audit logs |
| GET | /admin/audit-logs/:id | Get audit log |
| GET | /admin/locations/cities | List cities |
| GET | /admin/locations/districts | List districts |

---

## 27. Error Handling & HTTP Status Codes

- **200** OK — Success
- **201** Created — Resource created (e.g. POST)
- **400** Bad Request — Validation error (include `message`, `errors?`)
- **401** Unauthorized — Missing or invalid admin token
- **403** Forbidden — Admin has no permission
- **404** Not Found — Resource not found
- **409** Conflict — Business rule violation (e.g. duplicate promo code)
- **422** Unprocessable Entity — Semantic validation failed
- **500** Internal Server Error — Server error

**Error response shape:**
```json
{
  "message": "string",
  "errors": [{ "field": "string", "message": "string" }],
  "code": "VALIDATION_ERROR"
}
```

---

## 28. Implementation Priority

1. Admin auth (login, logout, token validation)
2. Users & contractors (list, get, filters)
3. Requests, quotations, contracts, projects
4. Invoices, payments, settlements
5. Complaints (respond), support tickets (reply)
6. Chat (threads, messages, settings, bans)
7. Notifications (list, broadcast)
8. Services CRUD (groups, categories, subcategories, quick services)
9. Promo codes
10. Contractor verification
11. ZATCA (issue, retry, XML)
12. Zoho sync
13. Settings
14. BI stats
15. Audit logs

---

**End of Specification**

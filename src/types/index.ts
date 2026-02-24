// ============================================
// Enums - الحالات والأنواع
// ============================================

export enum UserRole {
  CLIENT = 'CLIENT',        // عميل
  CONTRACTOR = 'CONTRACTOR' // مقاول
}

export enum RequestStatus {
  DRAFT = 'DRAFT',           // مسودة
  SUBMITTED = 'SUBMITTED',   // مرسلة
  CANCELLED = 'CANCELLED',   // ملغاة
  ACCEPTED = 'ACCEPTED',     // مقبولة
  COMPLETED = 'COMPLETED'    // مكتملة
}

export enum QuotationStatus {
  PENDING = 'PENDING',       // قيد الانتظار
  ACCEPTED = 'ACCEPTED',     // مقبول
  REJECTED = 'REJECTED',     // مرفوض
  WITHDRAWN = 'WITHDRAWN'    // منسحب
}

export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',   // لم يبدأ
  IN_PROGRESS = 'IN_PROGRESS',    // قيد التنفيذ
  PAUSED = 'PAUSED',              // متوقف
  COMPLETED = 'COMPLETED',        // مكتمل
  CANCELLED = 'CANCELLED'         // ملغي
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',           // مسودة
  SENT = 'SENT',             // مرسلة
  APPROVED = 'APPROVED',      // موافق عليها
  REJECTED = 'REJECTED',      // مرفوضة
  PAID = 'PAID'              // مدفوعة
}

export enum PaymentStatus {
  PENDING = 'PENDING',       // قيد الانتظار
  PROCESSING = 'PROCESSING', // قيد المعالجة
  SUCCESS = 'SUCCESS',        // نجح
  FAILED = 'FAILED',          // فشل
  REFUNDED = 'REFUNDED'       // مسترد
}

export enum ComplaintType {
  DELAY = 'DELAY',            // تأخير
  QUALITY = 'QUALITY',        // جودة
  SCOPE = 'SCOPE',            // نطاق العمل
  PAYMENT = 'PAYMENT',        // فواتير/دفع
  OTHER = 'OTHER'             // أخرى
}

export enum ComplaintStatus {
  OPEN = 'OPEN',              // مفتوحة
  IN_REVIEW = 'IN_REVIEW',    // قيد المراجعة
  RESOLVED = 'RESOLVED',      // محلولة
  CLOSED = 'CLOSED'          // مغلقة
}

export enum VerificationStatus {
  PENDING = 'PENDING',        // قيد المراجعة
  VERIFIED = 'VERIFIED',      // موثق
  REJECTED = 'REJECTED'       // مرفوض
}

export enum ZATCAStatus {
  NOT_ISSUED = 'NOT_ISSUED',  // لم تصدر
  PENDING = 'PENDING',        // قيد الانتظار
  ISSUED = 'ISSUED',          // صادرة
  REJECTED = 'REJECTED'       // مرفوضة
}

export enum QuickServiceOrderStatus {
  DRAFT = 'DRAFT',            // مسودة
  SENT = 'SENT',              // مرسل
  ACCEPTED = 'ACCEPTED',      // مقبول
  CANCELLED = 'CANCELLED',    // ملغي
  COMPLETED = 'COMPLETED'     // مكتمل
}

// ============================================
// Interfaces - نماذج البيانات الرئيسية
// ============================================

// 1. User - المستخدم الأساسي
export interface User {
  id: string;              // رقم الهوية الوطنية
  phone: string;           // رقم الجوال
  name: string;            // الاسم الكامل
  email?: string;          // البريد الإلكتروني (اختياري)
  role: UserRole;          // الدور
  isActive?: boolean;       // حالة الحساب - نشط/معطل (للوحة التحكم)
  createdAt: string;       // تاريخ الإنشاء
}

// 2. Address - العنوان
export interface Address {
  id: string;
  city: string;            // المدينة
  district: string;        // الحي
  detailed?: string;       // العنوان التفصيلي
  isDefault: boolean;      // العنوان الافتراضي
}

// 3. ClientProfile - بيانات العميل
export interface ClientProfile extends User {
  role: UserRole.CLIENT;
  addresses?: Address[];   // العناوين المحفوظة
}

// 4. ContractorProfile - بيانات المقاول
export interface ContractorProfile extends User {
  role: UserRole.CONTRACTOR;
  companyName?: string;                    // اسم الشركة
  rating: number;                          // التقييم (0-5)
  totalRatings?: number;                   // عدد التقييمات (للوحة التحكم)
  verificationStatus: VerificationStatus;  // حالة التحقق
  verifiedAt?: string;                     // تاريخ التحقق (للوحة التحكم)
  rejectedAt?: string;                     // تاريخ الرفض (للوحة التحكم)
  verificationNotes?: string;              // ملاحظات التحقق (للوحة التحكم)
  services: string[];                      // الخدمات المقدمة
  coverageAreas: string[];                // مناطق التغطية (قائمة بسيطة)
  coverageAreasWithDistricts?: {          // مناطق التغطية مع الأحياء
    city: string;
    districts: string[];
  }[];
  portfolio?: string[];                   // معرض الأعمال (معرفات)
  companyDescription?: string;             // وصف الشركة
  commercialRegistration?: string;         // رقم السجل التجاري
  taxId?: string;                         // الرقم الضريبي (من بيانات المنشأة - للوحة التحكم)
  companyAddress?: string;               // عنوان الشركة (من بيانات المنشأة - للوحة التحكم)
  companyPhone?: string;                 // هاتف الشركة (من بيانات المنشأة - للوحة التحكم)
  companyEmail?: string;                  // البريد الإلكتروني للشركة (من بيانات المنشأة - للوحة التحكم)
}

// 5. ServiceRequest - الطلب العادي
export interface ServiceRequest {
  id: string;                              // معرف الطلب
  clientId: string;                        // معرف العميل
  serviceId: string;                       // معرف الخدمة
  serviceName: string;                     // اسم الخدمة
  title: string;                           // عنوان الطلب
  description: string;                     // وصف الطلب
  urgency: 'normal' | 'urgent';          // الاستعجال (عادي/مستعجل)
  hasDesign?: boolean;                     // هل لديك مخطط/تصميم؟ (اختياري)
  requirements: string[];                  // المتطلبات
  location: {
    city: string;                          // المدينة
    district: string;                     // الحي
    detailed?: string;                     // العنوان التفصيلي
  };
  budgetRange: string;                     // نطاق الميزانية (مثل: "5,000 – 10,000") - hidden for now
  materialsIncluded?: boolean;             // المواد مشمولة (يحددها العميل عند إنشاء الطلب)
  startDate?: string;                      // تاريخ البدء
  expectedDuration?: string;             // المدة المتوقعة (مثل: "2–4 أسابيع")
  allowSiteVisits: boolean;               // السماح بزيارات الموقع
  attachments: string[];                  // المرفقات (روابط الملفات) - قد يتضمن المخطط إذا كان hasDesign = true
  notes?: string;                         // ملاحظات إضافية
  status: RequestStatus;                  // حالة الطلب
  rating?: number;                        // التقييم (1-5) إذا كان مكتملاً ومقيماً
  offersCount?: number;                    // عدد العروض (حساب تلقائي)
  createdAt: string;                      // تاريخ الإنشاء
  updatedAt: string;                      // تاريخ التحديث
}

// 6. QuickServiceOrder - طلب الخدمة السريعة
export interface QuickServiceOrder {
  id: string;                              // معرف الطلب
  clientId: string;                        // معرف العميل
  serviceId: string;                       // معرف الخدمة السريعة
  serviceTitle: string;                   // عنوان الخدمة السريعة
  title?: string;                          // عنوان الطلب (اختياري)
  description?: string;                   // وصف الطلب (اختياري)
  urgency?: 'normal' | 'urgent';         // الاستعجال
  attachments?: string[];                 // المرفقات
  price: number;                          // السعر
  duration: string;                        // المدة (مثل: "ساعتان")
  location: {
    city: string;
    district: string;
    detailed?: string;
  };
  materialsIncluded?: boolean;            // المواد مشمولة (يحددها العميل عند إنشاء الطلب)
  scheduledDate?: string;                 // التاريخ المجدول
  status: QuickServiceOrderStatus;        // الحالة
  contractorId?: string;                  // معرف المقاول (إذا تم القبول)
  contractorName?: string;                // اسم المقاول
  rating?: number;                        // التقييم (1-5)
  createdAt: string;
  updatedAt: string;
}

// 7. QuickService - الخدمة السريعة
export interface QuickService {
  id: string;                              // معرف الخدمة
  title: string;                          // العنوان
  price: number;                          // السعر
  duration: string;                        // المدة
  description?: string;                   // الوصف
  icon?: string;                          // الأيقونة (من Ionicons) - اختياري
  displayOrder?: number;                  // ترتيب العرض - اختياري
  isActive?: boolean;                     // نشط/غير نشط - اختياري
  createdAt?: string;                     // تاريخ الإنشاء - اختياري
  updatedAt?: string;                     // تاريخ التحديث - اختياري
}

// 8. Quotation - العرض
export interface Quotation {
  id: string;                              // معرف العرض
  requestId: string;                      // معرف الطلب
  contractorId: string;                   // معرف المقاول
  contractorName: string;                 // اسم المقاول
  contractorRating: number;               // تقييم المقاول
  price: number;                          // السعر
  duration: number | string;              // المدة (بالأيام للطلبات العادية، نص للخدمات السريعة)
  materialsIncluded: boolean;             // المواد مشمولة
  materialsDetails?: string;             // تفاصيل المواد
  notes?: string;                         // ملاحظات
  additionalTerms?: string;              // شروط إضافية
  installments?: Array<{                 // الدفعات
    id: string;
    title: string;                        // عنوان الدفعة (مثل: "الدفعة الأولى")
    amount: number;                       // المبلغ
    description: string;                  // الوصف
    dueDate?: string;                    // تاريخ الاستحقاق
  }>;
  executionPhases?: Array<{              // مراحل التنفيذ
    id: string;
    title: string;                        // عنوان المرحلة
    duration: number;                     // المدة (بالأيام)
    description: string;                  // الوصف
    linkedInstallmentId?: string;        // معرف الدفعة المرتبطة
  }>;
  attachments: string[];                  // المرفقات
  status: QuotationStatus;               // الحالة
  createdAt: string;                     // تاريخ الإنشاء
}

// 9. Milestone - المعلم/الدفعة
export interface Milestone {
  id: string;                              // معرف المعلم
  name: string;                           // الاسم (مثل: "عربون")
  percentage: number;                     // النسبة المئوية
  amount: number;                         // المبلغ
  status: 'NotDue' | 'Due' | 'Paid';    // الحالة
  dueDate?: string;                      // تاريخ الاستحقاق
  paidAt?: string;                       // تاريخ الدفع
  description?: string;                  // الوصف
}

// 10. Contract - العقد
export interface Contract {
  id: string;                              // معرف العقد
  requestId: string;                     // معرف الطلب
  quotationId: string;                   // معرف العرض المقبول
  clientId: string;                      // معرف العميل
  contractorId: string;                  // معرف المقاول
  scope: string;                         // نطاق العمل
  totalPrice: number;                    // السعر الإجمالي
  duration: number;                      // المدة (بالأيام)
  milestones: Milestone[];               // المعالم/الدفعات
  createdAt: string;                     // تاريخ الإنشاء
}

// 11. Project - المشروع
export interface Project {
  id: string;                              // معرف المشروع
  contractId: string;                    // معرف العقد
  requestId: string;                     // معرف الطلب
  clientId: string;                      // معرف العميل
  contractorId: string;                  // معرف المقاول
  title: string;                         // العنوان
  status: ProjectStatus;                 // الحالة
  progress: number;                      // التقدم (0-100)
  createdAt: string;                     // تاريخ الإنشاء
  updatedAt: string;                     // تاريخ التحديث
}

// 12. Invoice - الفاتورة
export interface Invoice {
  id: string;                              // معرف الفاتورة (مثل: "INV-2026-5488")
  projectId: string;                     // معرف المشروع
  contractorId: string;                  // معرف المقاول
  clientId: string;                      // معرف العميل
  milestoneId?: string;                  // معرف الدفعة المرتبطة (التي تم إنشاؤها مع العرض)
  title: string;                         // عنوان الفاتورة
  description?: string;                  // الوصف
  amount: number;                        // المبلغ (قبل الضريبة)
  vatAmount: number;                     // قيمة الضريبة (15%)
  totalAmount: number;                   // المبلغ الإجمالي
  dueDate: string;                       // تاريخ الاستحقاق
  status: InvoiceStatus;                 // الحالة
  zatcaStatus: ZATCAStatus;             // حالة ZATCA
  zatcaUUID?: string;                    // UUID من ZATCA
  zohoId?: string;                       // معرف Zoho
  attachments: string[];                 // المرفقات
  createdAt: string;                     // تاريخ الإنشاء
  paidAt?: string;                       // تاريخ الدفع (عندما تكون مدفوعة)
}

// 13. Payment - الدفع
export interface Payment {
  id: string;                              // معرف الدفع
  invoiceId: string;                     // معرف الفاتورة
  amount: number;                        // المبلغ
  status: PaymentStatus;                 // الحالة
  paymentMethod: string;                 // طريقة الدفع (مثل: "بطاقة", "مدى")
  referenceNumber?: string;              // رقم المرجع (للوحة التحكم)
  noonPaymentId?: string;               // معرف Noon Payment
  noonReference?: string;               // المرجع من Noon
  processedAt?: string;                 // تاريخ المعالجة (للوحة التحكم)
  successAt?: string;                   // تاريخ النجاح (للوحة التحكم)
  failedAt?: string;                    // تاريخ الفشل (للوحة التحكم)
  refundedAt?: string;                  // تاريخ الاسترداد (للوحة التحكم)
  refundReason?: string;                // سبب الاسترداد (للوحة التحكم)
  refundedBy?: string;                  // من قام بالاسترداد - معرف المشرف (للوحة التحكم)
  createdAt: string;                     // تاريخ الإنشاء
}

// 13.5. Settlement - التسوية
export interface Settlement {
  id: string;                              // معرف التسوية
  contractorId: string;                    // معرف المقاول
  contractorName: string;                  // اسم المقاول
  periodStart: string;                     // تاريخ بداية الفترة
  periodEnd: string;                       // تاريخ نهاية الفترة
  grossAmount: number;                     // المبلغ الإجمالي
  platformFee: number;                     // رسوم المنصة
  vatAmount: number;                       // قيمة الضريبة
  netPayout: number;                      // المبلغ الصافي المستحق
  status: 'Pending' | 'Processing' | 'Paid' | 'Rejected'; // الحالة
  createdAt: string;                      // تاريخ الإنشاء
}

// 14. Complaint - الشكوى
export interface Complaint {
  id: string;                              // معرف الشكوى
  projectId: string;                     // معرف المشروع
  clientId: string;                      // معرف العميل
  contractorId: string;                  // معرف المقاول
  raisedBy: 'CLIENT' | 'CONTRACTOR';     // من رفع الشكوى
  type: ComplaintType;                   // نوع الشكوى
  description: string;                   // الوصف
  attachments: string[];                 // المرفقات
  status: ComplaintStatus;               // الحالة
  response?: string;                     // الرد من الإدارة (خدمة العملاء)
  respondedAt?: string;                  // تاريخ الرد
  respondedBy?: string;                 // من قام بالرد
  createdAt: string;                     // تاريخ الإنشاء
}

// 15. ProjectReport - تقرير المشروع
export interface ProjectReport {
  id: string;                              // معرف التقرير
  projectId: string;                     // معرف المشروع
  contractorId: string;                  // معرف المقاول
  title: string;                         // العنوان
  type: 'PROGRESS' | 'QUALITY' | 'WEEKLY' | 'MONTHLY' | 'FINAL';
  description: string;                   // الوصف
  progress?: number;                     // التقدم (0-100)
  attachments: string[];                 // المرفقات
  createdAt: string;                     // تاريخ الإنشاء
}

// 16. ChatThread - محادثة
export interface ChatThread {
  id: string;                              // معرف المحادثة
  clientId: string;                      // معرف العميل
  contractorId: string;                  // معرف المقاول
  relatedType: 'request' | 'project' | 'invoice';
  relatedId: string;                     // معرف العنصر المرتبط
  lastMessage?: ChatMessage;             // آخر رسالة
  unreadCount: number;                   // عدد الرسائل غير المقروءة
  updatedAt: string;                     // تاريخ التحديث
}

// 17. ChatMessage - رسالة المحادثة
export interface ChatMessage {
  id: string;                              // معرف الرسالة
  threadId: string;                      // معرف المحادثة
  senderId: string;                      // معرف المرسل
  senderRole: UserRole;                  // دور المرسل
  content: string;                       // المحتوى
  attachments?: string[];                // المرفقات
  createdAt: string;                     // تاريخ الإنشاء
}

// 18. Notification - الإشعار
export interface Notification {
  id: string;                              // معرف الإشعار
  userId: string;                        // معرف المستخدم
  title: string;                         // العنوان
  body: string;                         // المحتوى
  type: 'offer' | 'payment' | 'complaint' | 'general';
  relatedId?: string;                   // معرف العنصر المرتبط
  read: boolean;                        // مقروء/غير مقروء
  createdAt: string;                    // تاريخ الإنشاء
}

// 19. ServiceGroup - مجموعة الخدمات
export interface ServiceGroup {
  id: string;                              // معرف المجموعة
  name: string;                          // الاسم (مثل: "التصميم")
  description: string;                    // الوصف
  icon?: string;                          // الأيقونة (من Ionicons) - اختياري
  displayOrder?: number;                  // ترتيب العرض - اختياري
  isActive?: boolean;                     // نشط/غير نشط - اختياري
  categories?: Category[];                // الفئات
  createdAt?: string;                     // تاريخ الإنشاء - اختياري
  updatedAt?: string;                     // تاريخ التحديث - اختياري
}

// 20. Category - الفئة
export interface Category {
  id: string;                              // معرف الفئة
  name: string;                           // الاسم (مثل: "معماري")
  groupId: string;                        // معرف المجموعة
  displayOrder?: number;                  // ترتيب العرض - اختياري
  isActive?: boolean;                     // نشط/غير نشط - اختياري
  subcategories: Subcategory[];           // الفئات الفرعية
  createdAt?: string;                     // تاريخ الإنشاء - اختياري
  updatedAt?: string;                     // تاريخ التحديث - اختياري
}

// 21. Subcategory - الفئة الفرعية
export interface Subcategory {
  id: string;                              // معرف الفئة الفرعية
  name: string;                           // الاسم (مثل: "تصميم معماري كامل")
  description?: string;                   // الوصف
  categoryId: string;                     // معرف الفئة
  icon?: string;                          // الأيقونة (من Ionicons) - اختياري
  displayOrder?: number;                  // ترتيب العرض - اختياري
  isActive?: boolean;                     // نشط/غير نشط - اختياري
  createdAt?: string;                     // تاريخ الإنشاء - اختياري
  updatedAt?: string;                     // تاريخ التحديث - اختياري
}

// 22. PortfolioItem - عنصر المعرض
export interface PortfolioItem {
  id: string;                              // معرف العنصر
  imageUri: string;                      // رابط الصورة
  title: string;                          // العنوان
  description: string;                    // الوصف
  date: string;                          // التاريخ
  city: string;                          // المدينة
}

// 23. Rating - التقييم
export interface Rating {
  id: string;                              // معرف التقييم (ratingId)
  projectId?: string;                     // معرف المشروع (إن كان مرتبطاً بمشروع)
  requestId?: string;                     // معرف الطلب (إن كان مرتبطاً بطلب)
  contractorId: string;                  // معرف المقاول المقيّم
  clientId: string;                       // معرف العميل المقيّم
  rating: number;                         // النجوم (1-5)
  tags?: string[];                        // الصفات (مثل: التزام، جودة، سرعة، تعامل)
  comment?: string;                       // التعليق (نص متعدد الأسطر)
  createdAt: string;                      // تاريخ الإنشاء
}

// 24. PaymentMethod - طريقة الدفع المحفوظة
export interface PaymentMethod {
  id: string;                              // معرف طريقة الدفع (paymentMethodId)
  userId: string;                        // معرف المستخدم (العميل)
  type: 'card' | 'mada' | 'apple_pay';   // نوع طريقة الدفع (paymentMethodType)
  last4Digits?: string;                   // آخر 4 أرقام (last4Digits)
  createdAt: string;                     // تاريخ الإضافة
}

// 25. SupportTicket - تذكرة الدعم
export interface SupportTicket {
  id: string;                              // معرف التذكرة
  userId: string;                         // معرف المستخدم
  role: UserRole;                         // الدور (CLIENT/CONTRACTOR)
  title: string;                          // العنوان
  description: string;                    // الوصف
  attachments: string[];                  // المرفقات
  status: 'open' | 'in_progress' | 'closed'; // الحالة (مفتوحة/قيد المعالجة/مغلقة)
  replies?: SupportTicketReply[];         // الردود
  createdAt: string;                     // تاريخ الإنشاء
  updatedAt: string;                     // تاريخ آخر تحديث
}

// 26. SupportTicketReply - رد تذكرة الدعم
export interface SupportTicketReply {
  id: string;                              // معرف الرد
  ticketId: string;                      // معرف التذكرة
  senderId: string;                       // معرف المرسل (senderId)
  senderRole: 'user' | 'support';        // دور المرسل (senderRole)
  content: string;                        // المحتوى
  attachments?: string[];                // المرفقات
  createdAt: string;                      // التاريخ والوقت
}

// ============================================
// Audit Log - سجل التدقيق (للوحة التحكم)
// ============================================

export interface AuditLog {
  id: string;
  adminId: string;                        // معرف المشرف
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE'; // نوع الإجراء
  entityType: string;                     // نوع الكيان (مستخدم/طلب/مشروع/فاتورة/إلخ)
  entityId: string;                       // معرف الكيان
  beforeData?: Record<string, any>;       // التفاصيل قبل التعديل (JSON)
  afterData?: Record<string, any>;       // التفاصيل بعد التعديل (JSON)
  diff?: Record<string, any>;            // التغييرات (diff)
  ipAddress?: string;                     // عنوان IP
  userAgent?: string;                     // المتصفح/الجهاز
  createdAt: string;                      // تاريخ الإجراء
}

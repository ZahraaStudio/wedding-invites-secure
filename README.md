# دعوتي — Dawaty Wedding Invitations

نسخة GitHub Flat جاهزة للرفع: كل الملفات في جذر المشروع بدون مجلدات داخلية.

## ما تم إضافته في هذه النسخة
- Cloudinary لرفع صور العريس والعروسة مباشرة من المتصفح.
- إعداد Cloudinary المضمّن:
  - Cloud Name: `dxlxwe55b`
  - Upload Preset: `zahraa_upload`
  - Upload: Unsigned
- محرر دعوة مطوّر: القالب، اللون، الخط، شكل الكارت، نص الدعوة، وصور العريس والعروسة مع معاينة مباشرة.
- روابط شخصية لكل ضيف.
- QR Code شخصي داخل الدعوة.
- QR Check-in من لوحة العميل عبر توكن الضيف.
- نظام طاولات وتعيين الضيوف للطاولات.
- زر إرسال WhatsApp برسالة شخصية ورابط الضيف.
- استيراد Excel / XLS / CSV / Word DOCX مع دعم أعمدة الاسم والهاتف والطاولة بعدة مسميات عربية وإنجليزية.
- نشر / إيقاف الدعوة مع مزامنة الحالة مع روابط الضيوف.
- تتبع المشاهدة، RSVP، وعدد المسجلين عند الدخول.
- إصلاح إنشاء حساب العميل من لوحة الإدارة.

## النشر على GitHub Pages
1. ارفع الملفات كلها إلى جذر المستودع.
2. فعّل GitHub Pages من Settings → Pages.
3. استخدم Firebase Authentication + Firestore للمستخدمين والبيانات.
4. انشر آخر نسخة من `firestore.rules` و`storage.rules` في مشروع Firebase؛ قواعد الإدارة في هذه النسخة تسمح للحساب بقراءة مستند `admins` الخاص به لتجنب تعليق التحقق.

## حل خطأ Firebase App Check

إذا ظهر عند تسجيل الدخول الخطأ `auth/firebase-app-check-token-is-invalid`:

1. من Firebase Console افتح **Authentication → Settings → App Check** وتأكد أن الدومين المرفوع عليه الموقع مضاف ضمن Authorized Domains.
2. إذا كان App Check مفعّلًا على Authentication، أنشئ أو انسخ **reCAPTCHA v3 Site Key** وضعه في `appCheckSiteKey` داخل `firebase-config-module.js`.
3. إذا لم تكن تريد App Check حاليًا، عطّل Enforcement الخاص بـ Authentication مؤقتًا. لا تضع Secret Key داخل أي ملف واجهة.
4. امسح جلسة المتصفح من زر «واجهت خطأ App Check؟» في صفحة الدخول ثم أعد المحاولة.

النسخة تهيئ App Check تلقائيًا عند وجود Site Key، وتعمل بدون التهيئة عندما يكون الحقل فارغًا.

## Cloudinary
يجب أن يكون Upload Preset باسم `zahraa_upload` من نوع **Unsigned** في Cloudinary. لا تضع API Secret في ملفات الواجهة.

## ملاحظة QR Check-in
النسخة الحالية تنشئ QR فعلي لكل ضيف، وتوفر شاشة Check-in تقبل توكن QR. يمكن لاحقًا إضافة مسح الكاميرا مباشرة داخل الشاشة إذا رغبت في ذلك.

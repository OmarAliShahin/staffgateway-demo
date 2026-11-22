import type { Locale } from "@/providers/app-providers"

/** Labels are sentence case in English — never uppercase. */
export const strings = {
  en: {
    appTitle: "Staff Gateway",
    appSubtitle: "Design system · components",
    theme: { light: "Light", dark: "Dark", system: "System" },
    language: "العربية",
    button: {
      title: "Button",
      description:
        "Primary = the one main action (blue + glow). Secondary = glass. Ghost = quiet actions. Danger = red text, no fill (tint only on hover). Pills, 40 high (small 32).",
      createOffer: "Create new offer",
      importCsv: "Import CSV",
      cancel: "Cancel",
      delete: "Delete",
    },
    textField: {
      title: "Text field",
      description:
        "Label above (sentence case, 13 medium), field 40 high with a 14 radius, hint or error below. Required fields show a red asterisk.",
      label: "Offer title",
      value: "Weekday family pass",
      hint: "Shown on the offer card",
      required: "Required",
      unit: "meters",
      add: "Add",
      email: "Email address",
      emailHint: "We'll send the offer summary here",
      password: "Password",
      distance: "Distance",
      options: ["Weekday family pass", "Weekend family pass", "Single entry"],
    },
    tokens: { title: "Color tokens", description: "Every token switches with the theme." },
  },
  ar: {
    appTitle: "بوابة الموظفين",
    appSubtitle: "نظام التصميم · المكوّنات",
    theme: { light: "فاتح", dark: "داكن", system: "النظام" },
    language: "English",
    button: {
      title: "الأزرار",
      description:
        "الأساسي = الإجراء الرئيسي الوحيد (أزرق مع توهّج). الثانوي = زجاجي. الشفاف = إجراءات هادئة. الحذف = نص أحمر بلا تعبئة (تلوين عند التمرير فقط). أزرار دائرية، بارتفاع ٤٠ (الصغير ٣٢).",
      createOffer: "إنشاء عرض جديد",
      importCsv: "استيراد CSV",
      cancel: "إلغاء",
      delete: "حذف",
    },
    textField: {
      title: "حقل النص",
      description:
        "العنوان في الأعلى، الحقل بارتفاع ٤٠ وزوايا ١٤، والتلميح أو الخطأ في الأسفل. الحقول الإلزامية تُظهر علامة نجمة حمراء.",
      label: "عنوان العرض",
      value: "باقة العائلة لأيام الأسبوع",
      hint: "يظهر على بطاقة العرض",
      required: "مطلوب",
      unit: "متر",
      add: "إضافة",
      email: "البريد الإلكتروني",
      emailHint: "سنرسل ملخص العرض إلى هنا",
      password: "كلمة المرور",
      distance: "المسافة",
      options: ["باقة العائلة لأيام الأسبوع", "باقة العائلة لنهاية الأسبوع", "دخول فردي"],
    },
    tokens: { title: "رموز الألوان", description: "كل رمز يتبدّل مع السمة." },
  },
} satisfies Record<Locale, unknown>

export type Strings = (typeof strings)["en"]

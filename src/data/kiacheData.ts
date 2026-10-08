export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr';

export interface IngredientEntry {
  key: string;
  label: string;
  category: string;
  eNumber?: string;
  insNumber?: string;
  why: string;
  watch?: string;
  eli5?: string;
  scientist?: string;
}

export interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  quantity?: string;
  image_front_small_url?: string;
  ingredients_text?: string;
  nutriscore_grade?: string;
  nova_group?: number;
  additives_tags?: string[];
  allergens_tags?: string[];
  traces_tags?: string[];
  nutrient_levels?: {
    sugars?: 'low' | 'moderate' | 'high';
    fat?: 'low' | 'moderate' | 'high';
    'saturated-fat'?: 'low' | 'moderate' | 'high';
    salt?: 'low' | 'moderate' | 'high';
  };
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    sugars_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
  categories?: string;
  labels?: string;
}

export interface ScanHistoryItem {
  id: string;
  type: 'barcode' | 'photo';
  code?: string;
  product?: OpenFoodFactsProduct;
  rawText?: string;
  name: string;
  date: string;
  score: string;
  favorite?: boolean;
}

export interface LastScanContext {
  name: string;
  text?: string;
  product?: OpenFoodFactsProduct;
  ingredients?: string;
  flags: IngredientEntry[];
  allergyHits: string[];
  sugar?: number | null;
  protein?: number | null;
}

export const facts: [string, string][] = [
  [
    "Your gut can help shape what you choose next",
    "The gut–brain system sends signals involved in hunger, fullness and food-related responses. Food choices are influenced by far more than willpower alone."
  ],
  [
    "A label can list the same nutrient in disguise",
    "Added sugars may appear under names such as dextrose, maltose, syrups or concentrates. KIACHE groups common terms so one ingredient name does not hide the bigger picture."
  ],
  [
    "A barcode is an identity key, not a health score",
    "The same barcode can identify a product while its nutrition profile depends on the exact formulation and market. KIACHE shows the source and avoids turning a barcode into a medical verdict."
  ],
  [
    "NOVA and Nutri-Score answer different questions",
    "Nutri-Score summarizes nutritional quality using a grading system, while NOVA describes the degree and purpose of food processing. One cannot be substituted for the other."
  ],
  [
    "Ingredient order is a useful clue",
    "In many packaged-food labels, ingredients are listed in descending order by weight when added. That makes the first few ingredients especially useful when reading a label."
  ],
  [
    "Some foods naturally contain compounds that sound technical",
    "Citric acid, pectin, lecithin and ascorbic acid can all occur naturally or be used in food processing. A scientific-sounding name is not, by itself, evidence that an ingredient is unsafe."
  ],
  [
    "'No added sugar' is not the same as sugar-free",
    "A food can contain naturally occurring sugars even when no sugar has been added. The ingredient list and nutrition panel together give a clearer picture."
  ],
  [
    "Serving size changes the meaning of every number",
    "A nutrition panel can look very different when a package contains several servings. Always compare the stated serving with the amount you actually plan to eat."
  ],
  [
    "Protein on the front does not tell the whole story",
    "A product can be a meaningful source of protein and still contain substantial sodium, saturated fat or added sugar. Good label reading looks at the pattern, not one headline claim."
  ],
  [
    "'Whole grain' and 'multigrain' are not interchangeable",
    "Multigrain only tells you that more than one grain is present. Whole-grain wording gives a different clue about whether the grain itself is whole."
  ],
  [
    "A product photo can be useful even when a barcode fails",
    "Regional products, new launches and incomplete databases can produce missing barcode records. OCR can still extract the printed label, while KIACHE clearly marks what came from image recognition."
  ],
  [
    "Food labels are designed to be read in context",
    "Nutrition numbers, ingredient order, serving size, allergens and processing descriptions each answer different questions. A single red-looking number should not be treated as a diagnosis."
  ]
];

export const i18n: Record<LanguageCode, Record<string, string>> = {
  en: {
    home: "Home",
    history: "Scan history",
    settings: "Settings",
    scan: "Scan a label",
    scanNav: "Scan",
    modeBarcode: "Barcode / product",
    modePhoto: "Read label",
    barcodeIntro: "Use the camera for a barcode, type the barcode, or search by a product name or ingredient.",
    barcodePlaceholder: "e.g. 8901058851419",
    lookUp: "Look up →",
    scanWithCamera: "Scan barcode",
    productSearchPlaceholder: "Search a food, dish, ingredient or brand",
    searchProduct: "Search food",
    sourceNote: "Product matches are cross-checked against available public food data. If data is missing, KIACHE says so rather than guessing.",
    homeGreetingTitle: "Know what's really in your food.",
    welcome: "Welcome to KIACHE",
    entryTitle: "Know what's really in your food.",
    entryDesc: "Scan food labels, understand ingredients, and make sense of nutrition information without the noise.",
    chooseLanguage: "Choose your language",
    getStarted: "Start with KIACHE →",
    allergyOnboardingTitle: "Allergy preferences",
    allergyOnboardingHelp: "Select anything you want KIACHE to flag prominently.",
    heroEyebrow: "Know what's really in your food.",
    heroTitle: "Scan. Decode. Decide.",
    heroDesc: "KIACHE reads food labels, translates unfamiliar language, explains ingredients and nutrition, and helps you make informed choices without fear-based language.",
    scanLabel: "Scan a label →",
    didYouKnow: "Did you know?",
    tinyFact: "A food fact worth knowing.",
    labelCheck: "Label check",
    labelMore: "Your label has more to say.",
    labelDesc: "Use the camera or a clear label photo and KIACHE will extract what it can, then show where the information came from.",
    openScanner: "Open scanner →",
    recentScans: "Recent scans",
    savedLater: "Saved for later",
    scannerEyebrow: "KIACHE / Scanner",
    decodeTitle: "Let's decode it.",
    useCamera: "Use camera",
    capturePhoto: "Capture & read",
    cancelCamera: "Cancel",
    choosePhoto: "Choose label photo",
    demoLabel: "Try demo",
    historyEyebrow: "KIACHE / History",
    yourScans: "Your scans.",
    clearHistory: "Clear history",
    settingsEyebrow: "KIACHE / Settings",
    makeKIACHE: "Make KIACHE work for you.",
    yourExperience: "Your experience",
    languageLabel: "Language",
    languageHelp: "Change the app language instantly.",
    yourNameLabel: "Your name",
    yourNameHelp: "Optional display name.",
    saveName: "Save name",
    dietPrefs: "Dietary preferences",
    usefulPrefs: "Choose what feels useful",
    prefsHelp: "These preferences guide the way label information is highlighted.",
    allergenAlerts: "Allergen alerts",
    allergenHelp: "Highlight ingredients you want KIACHE to watch for.",
    askKIACHE: "Ask KIACHE",
    chatWelcome: "Choose a question below. KIACHE uses a curated, rule-based food knowledge library here — no external AI API and no open-ended guesses.",
    aiQIngredients: "Do you want to know what a flagged ingredient does?",
    aiQNutrition: "Do you want to understand this product's nutrition?",
    aiQAllergens: "Do you want to check your allergy preferences against this product?",
    aiQProcessing: "Do you want to know what NOVA means here?",
    aiQScore: "Do you want to know what the Nutri-Score means?",
    aiQData: "Do you want to know how reliable this result is?",
    yes: "Yes",
    no: "No",
    noContext: "Scan a product first and KIACHE can answer questions specifically about that result.",
    reliable: "Reliability first",
    dictionaryNav: "Dictionary",
    compareNav: "Compare",
    quickInsight: "Quick insight",
    kiacheSnapshot: "Your KIACHE snapshot",
    dictionaryEyebrow: "KIACHE / Dictionary",
    dictionaryTitle: "The ingredient dictionary.",
    dictionaryDesc: "Search by ingredient name, E-number or INS number (e.g. \"E322\", \"INS 322\", \"lecithin\", \"sucralose\").",
    compareEyebrow: "KIACHE / Compare",
    compareTitle: "Which one fits you better?",
    compareDesc: "Enter two barcodes (or pick a sample pair below) to see a side-by-side comparison."
  },
  hi: {
    home: "होम",
    history: "स्कैन इतिहास",
    settings: "सेटिंग्स",
    scan: "लेबल स्कैन करें",
    scanNav: "स्कैन",
    modeBarcode: "बारकोड / उत्पाद",
    modePhoto: "लेबल पढ़ें",
    barcodeIntro: "बारकोड के लिए कैमरा इस्तेमाल करें, बारकोड टाइप करें या भोजन/सामग्री का नाम खोजें।",
    barcodePlaceholder: "उदा. 8901058851419",
    lookUp: "खोजें →",
    scanWithCamera: "बारकोड स्कैन करें",
    productSearchPlaceholder: "भोजन, व्यंजन, सामग्री या ब्रांड खोजें",
    searchProduct: "भोजन खोजें",
    sourceNote: "उपलब्ध सार्वजनिक खाद्य डेटा से मिलान किया जाता है। डेटा न मिले तो KIACHE अनुमान नहीं लगाता।",
    homeGreetingTitle: "जानें कि आपके खाने में वास्तव में क्या है।",
    welcome: "KIACHE में आपका स्वागत है",
    entryTitle: "जानें कि आपके खाने में वास्तव में क्या है।",
    entryDesc: "खाने के लेबल स्कैन करें, सामग्री समझें और पोषण जानकारी को सरल तरीके से पढ़ें।",
    chooseLanguage: "अपनी भाषा चुनें",
    getStarted: "KIACHE शुरू करें →",
    allergyOnboardingTitle: "एलर्जी पसंद",
    allergyOnboardingHelp: "जिन चीज़ों पर KIACHE खास ध्यान दे, उन्हें चुनें।",
    heroEyebrow: "जानें कि आपके खाने में वास्तव में क्या है।",
    heroTitle: "स्कैन करें। समझें। तय करें।",
    heroDesc: "KIACHE लेबल पढ़ता है, अनजान सामग्री समझाता है और बिना डर फैलाए जानकारी देता है।",
    scanLabel: "लेबल स्कैन करें →",
    didYouKnow: "क्या आप जानते हैं?",
    tinyFact: "जानने लायक खाद्य तथ्य।",
    labelCheck: "लेबल जाँच",
    labelMore: "आपके लेबल में और भी जानकारी है।",
    labelDesc: "कैमरा या साफ़ लेबल फोटो इस्तेमाल करें। KIACHE बताएगा कि जानकारी कहाँ से आई है।",
    openScanner: "स्कैनर खोलें →",
    recentScans: "हाल के स्कैन",
    savedLater: "बाद के लिए सहेजे गए",
    scannerEyebrow: "KIACHE / स्कैनर",
    decodeTitle: "आइए इसे समझते हैं।",
    useCamera: "कैमरा इस्तेमाल करें",
    capturePhoto: "कैप्चर और पढ़ें",
    cancelCamera: "रद्द करें",
    choosePhoto: "लेबल की फोटो चुनें",
    demoLabel: "डेमो",
    historyEyebrow: "KIACHE / इतिहास",
    yourScans: "आपके स्कैन।",
    clearHistory: "इतिहास साफ़ करें",
    settingsEyebrow: "KIACHE / सेटिंग्स",
    makeKIACHE: "KIACHE को अपने अनुसार बनाएँ।",
    yourExperience: "आपका अनुभव",
    languageLabel: "भाषा",
    languageHelp: "ऐप की भाषा बदलें।",
    yourNameLabel: "आपका नाम",
    yourNameHelp: "वैकल्पिक नाम।",
    saveName: "नाम सहेजें",
    dietPrefs: "आहार संबंधी पसंद",
    usefulPrefs: "जो उपयोगी लगे चुनें",
    prefsHelp: "इन पसंदों के अनुसार जानकारी हाइलाइट होगी।",
    allergenAlerts: "एलर्जन अलर्ट",
    allergenHelp: "जिन सामग्री पर नज़र रखनी है उन्हें चुनें।",
    askKIACHE: "KIACHE से पूछें",
    chatWelcome: "नीचे से सवाल चुनें। यहाँ KIACHE एक curated, rule-based food knowledge library इस्तेमाल करता है — external AI API या खुले अनुमान नहीं।",
    aiQIngredients: "क्या आप जानना चाहते हैं कि चिन्हित सामग्री क्या करती है?",
    aiQNutrition: "क्या आप इस उत्पाद का पोषण समझना चाहते हैं?",
    aiQAllergens: "क्या आप एलर्जी पसंदों से मिलान करना चाहते हैं?",
    aiQProcessing: "क्या आप जानना चाहते हैं कि NOVA यहाँ क्या मतलब रखता है?",
    aiQScore: "क्या आप Nutri-Score समझना चाहते हैं?",
    aiQData: "क्या आप जानना चाहते हैं कि यह परिणाम कितना विश्वसनीय है?",
    yes: "हाँ",
    no: "नहीं",
    noContext: "पहले कोई उत्पाद स्कैन करें, फिर KIACHE उसी परिणाम के बारे में बताएगा।",
    reliable: "विश्वसनीयता पहले",
    dictionaryNav: "शब्दकोश",
    compareNav: "तुलना",
    quickInsight: "त्वरित जानकारी",
    kiacheSnapshot: "आपकी KIACHE झलक",
    dictionaryEyebrow: "KIACHE / शब्दकोश",
    dictionaryTitle: "सामग्री शब्दकोश।",
    dictionaryDesc: "सामग्री का नाम, E-नंबर या INS नंबर खोजें (जैसे \"E322\", \"INS 322\", \"lecithin\", \"sucralose\")।",
    compareEyebrow: "KIACHE / तुलना",
    compareTitle: "आपके लिए कौन बेहतर है?",
    compareDesc: "दो बारकोड दर्ज करें (या नीचे दिए गए उदाहरण चुनें) साथ-साथ तुलना देखने के लिए।"
  },
  bn: {
    home: "হোম",
    history: "স্ক্যান ইতিহাস",
    settings: "সেটিংস",
    scan: "লেবেল স্ক্যান করুন",
    scanNav: "স্ক্যান",
    modeBarcode: "বারকোড / পণ্য",
    modePhoto: "লেবেল পড়ুন",
    barcodeIntro: "বারকোডের জন্য ক্যামেরা ব্যবহার করুন, বারকোড টাইপ করুন, বা পণ্যের নাম বা উপাদান দিয়ে খুঁজুন।",
    barcodePlaceholder: "যেমন 8901058851419",
    lookUp: "খুঁজুন →",
    scanWithCamera: "বারকোড স্ক্যান করুন",
    productSearchPlaceholder: "খাবার, পদ, উপাদান বা ব্র্যান্ড খুঁজুন",
    searchProduct: "খাবার খুঁজুন",
    sourceNote: "পাওয়া যায় এমন সর্বজনীন খাদ্য তথ্যের সাথে মিলিয়ে দেখা হয়। তথ্য না থাকলে KIACHE অনুমান করে না।",
    homeGreetingTitle: "জানুন আপনার খাবারে আসলে কী আছে।",
    welcome: "KIACHE-তে স্বাগতম",
    entryTitle: "জানুন আপনার খাবারে আসলে কী আছে।",
    entryDesc: "খাবারের লেবেল স্ক্যান করুন, উপাদান বুঝুন, এবং পুষ্টির তথ্য সহজভাবে জানুন।",
    chooseLanguage: "আপনার ভাষা বেছে নিন",
    getStarted: "KIACHE শুরু করুন →",
    allergyOnboardingTitle: "অ্যালার্জি পছন্দ",
    allergyOnboardingHelp: "যেগুলোর দিকে KIACHE বিশেষভাবে নজর দেবে সেগুলি বেছে নিন।",
    heroEyebrow: "জানুন আপনার খাবারে আসলে কী আছে।",
    heroTitle: "স্ক্যান করুন। বুঝুন। সিদ্ধান্ত নিন।",
    heroDesc: "KIACHE লেবেল পড়ে, অচেনা উপাদান ব্যাখ্যা করে এবং ভয় ছড়ানো ছাড়াই তথ্য দেয়।",
    scanLabel: "লেবেল স্ক্যান করুন →",
    didYouKnow: "আপনি কি জানেন?",
    tinyFact: "জানার মতো একটি খাদ্য তথ্য।",
    labelCheck: "লেবেল যাচাই",
    labelMore: "আপনার লেবেলে আরও অনেক কিছু বলার আছে।",
    labelDesc: "ক্যামেরা বা একটি স্পষ্ট লেবেলের ছবি দিন, KIACHE তা বুঝিয়ে দেবে।",
    openScanner: "স্ক্যানার খুলুন →",
    recentScans: "সাম্প্রতিক স্ক্যান",
    savedLater: "পরে দেখার জন্য সংরক্ষিত",
    scannerEyebrow: "KIACHE / স্ক্যানার",
    decodeTitle: "চলুন এটি বুঝি।",
    useCamera: "ক্যামেরা ব্যবহার করুন",
    capturePhoto: "ক্যাপচার ও পড়ুন",
    cancelCamera: "বাতিল করুন",
    choosePhoto: "লেবেলের ছবি বেছে নিন",
    demoLabel: "ডেমো দেখুন",
    historyEyebrow: "KIACHE / ইতিহাস",
    yourScans: "আপনার স্ক্যান।",
    clearHistory: "ইতিহাস মুছুন",
    settingsEyebrow: "KIACHE / সেটিংস",
    makeKIACHE: "KIACHE-কে আপনার মতো করুন।",
    yourExperience: "আপনার অভিজ্ঞতা",
    languageLabel: "ভাষা",
    languageHelp: "অ্যাপের ভাষা সাথে সাথে পরিবর্তন করুন।",
    yourNameLabel: "আপনার নাম",
    yourNameHelp: "ঐচ্ছিক প্রদর্শন নাম।",
    saveName: "নাম সংরক্ষণ করুন",
    dietPrefs: "খাদ্যাভ্যাসের পছন্দ",
    usefulPrefs: "যা উপযোগী মনে হয় তা বেছে নিন",
    prefsHelp: "এই পছন্দগুলি লেবেলের তথ্য হাইলাইট করার ধরন ঠিক করে।",
    allergenAlerts: "অ্যালার্জেন সতর্কতা",
    allergenHelp: "যে উপাদানগুলিতে KIACHE নজর রাখুক তা বেছে নিন।",
    askKIACHE: "KIACHE-কে জিজ্ঞাসা করুন",
    chatWelcome: "নিচে থেকে একটি প্রশ্ন বেছে নিন। এখানে KIACHE একটি নিয়ম-ভিত্তিক জ্ঞান-ভাণ্ডার ব্যবহার করে — কোনো external AI API বা মুক্ত অনুমান নেই।",
    aiQIngredients: "চিহ্নিত উপাদানটি কী করে জানতে চান?",
    aiQNutrition: "এই পণ্যের পুষ্টি বুঝতে চান?",
    aiQAllergens: "আপনার অ্যালার্জি পছন্দের সাথে মিলিয়ে দেখতে চান?",
    aiQProcessing: "NOVA-এর মানে জানতে চান?",
    aiQScore: "Nutri-Score-এর মানে জানতে চান?",
    aiQData: "এই ফলাফলটি কতটা নির্ভরযোগ্য জানতে চান?",
    yes: "হ্যাঁ",
    no: "না",
    noContext: "প্রথমে একটি পণ্য স্ক্যান করুন, তারপর KIACHE সেই ফলাফল সম্পর্কে বলতে পারবে।",
    reliable: "নির্ভরযোগ্যতা প্রথমে",
    dictionaryNav: "অভিধান",
    compareNav: "তুলনা",
    quickInsight: "দ্রুত পর্যালোচনা",
    kiacheSnapshot: "আপনার KIACHE সারাংশ",
    dictionaryEyebrow: "KIACHE / অভিধান",
    dictionaryTitle: "উপাদান অভিধান।",
    dictionaryDesc: "উপাদানের নাম, E-নম্বর বা INS নম্বর দিয়ে খুঁজুন (যেমন \"E322\", \"INS 322\", \"lecithin\", \"sucralose\")।",
    compareEyebrow: "KIACHE / তুলনা",
    compareTitle: "কোনটি আপনার জন্য ভালো?",
    compareDesc: "পাশাপাশি তুলনা দেখতে দুটি বারকোড লিখুন (অথবা নিচের উদাহরণ বেছে নিন)।"
  },
  mr: {
    home: "होम",
    history: "स्कॅन इतिहास",
    settings: "सेटिंग्ज",
    scan: "लेबल स्कॅन करा",
    scanNav: "स्कॅन",
    modeBarcode: "बारकोड / उत्पादन",
    modePhoto: "लेबल वाचा",
    barcodeIntro: "बारकोडसाठी कॅमेरा वापरा, बारकोड टाइप करा किंवा उत्पादनाचे नाव किंवा घटक शोधा.",
    barcodePlaceholder: "उदा. 8901058851419",
    lookUp: "शोधा →",
    scanWithCamera: "बारकोड स्कॅन करा",
    productSearchPlaceholder: "अन्न, पदार्थ, घटक किंवा ब्रँड शोधा",
    searchProduct: "अन्न शोधा",
    sourceNote: "उपलब्ध सार्वजनिक अन्न डेटाशी जुळवले जाते. डेटा नसल्यास KIACHE अंदाज लावत नाही.",
    homeGreetingTitle: "तुमच्या अन्नात खरंच काय आहे ते जाणून घ्या.",
    welcome: "KIACHE मध्ये स्वागत आहे",
    entryTitle: "तुमच्या अन्नात खरंच काय आहे ते जाणून घ्या.",
    entryDesc: "अन्नाची लेबले स्कॅन करा, घटक समजून घ्या आणि पोषण माहिती सोप्या पद्धतीने वाचा.",
    chooseLanguage: "तुमची भाषा निवडा",
    getStarted: "KIACHE सुरू करा →",
    allergyOnboardingTitle: "अ‍ॅलर्जी पसंती",
    allergyOnboardingHelp: "KIACHE ने ठळकपणे पाहावे असे घटक निवडा.",
    heroEyebrow: "तुमच्या अन्नात खरंच काय आहे ते जाणून घ्या.",
    heroTitle: "स्कॅन करा. समजून घ्या. ठरवा.",
    heroDesc: "KIACHE लेबल वाचते, अनोळखी घटक समजावते आणि भीती न पसरवता माहिती देते.",
    scanLabel: "लेबल स्कॅन करा →",
    didYouKnow: "तुम्हाला माहीत आहे का?",
    tinyFact: "जाणून घेण्यासारखी एक अन्न माहिती.",
    labelCheck: "लेबल तपासणी",
    labelMore: "तुमच्या लेबलमध्ये आणखी बरंच काही आहे.",
    labelDesc: "कॅमेरा किंवा स्पष्ट लेबल फोटो द्या, KIACHE ते समजावून सांगेल.",
    openScanner: "स्कॅनर उघडा →",
    recentScans: "अलीकडील स्कॅन",
    savedLater: "नंतरसाठी जतन केलेले",
    scannerEyebrow: "KIACHE / स्कॅनर",
    decodeTitle: "चला हे समजून घेऊया.",
    useCamera: "कॅमेरा वापरा",
    capturePhoto: "कॅप्चर करा आणि वाचा",
    cancelCamera: "रद्द करा",
    choosePhoto: "लेबल फोटो निवडा",
    demoLabel: "डेमो पहा",
    historyEyebrow: "KIACHE / इतिहास",
    yourScans: "तुमचे स्कॅन.",
    clearHistory: "इतिहास साफ करा",
    settingsEyebrow: "KIACHE / सेटिंग्ज",
    makeKIACHE: "KIACHE ला तुमच्यासारखे बनवा.",
    yourExperience: "तुमचा अनुभव",
    languageLabel: "भाषा",
    languageHelp: "अ‍ॅपची भाषा त्वरित बदला.",
    yourNameLabel: "तुमचे नाव",
    yourNameHelp: "ऐच्छिक प्रदर्शन नाव.",
    saveName: "नाव जतन करा",
    dietPrefs: "आहार प्राधान्ये",
    usefulPrefs: "उपयुक्त वाटेल ते निवडा",
    prefsHelp: "ही प्राधान्ये लेबल माहिती कशी ठळक करावी हे ठरवतात.",
    allergenAlerts: "अ‍ॅलर्जन सूचना",
    allergenHelp: "KIACHE ने लक्ष ठेवावे असे घटक निवडा.",
    askKIACHE: "KIACHE ला विचारा",
    chatWelcome: "खालून एक प्रश्न निवडा. येथे KIACHE एक नियम-आधारित माहिती संच वापरते — कोणतेही बाह्य AI API किंवा मुक्त अंदाज नाहीत.",
    aiQIngredients: "चिन्हांकित घटक काय करतो हे जाणून घ्यायचे आहे का?",
    aiQNutrition: "या उत्पादनाचे पोषण समजून घ्यायचे आहे का?",
    aiQAllergens: "तुमच्या अ‍ॅलर्जी प्राधान्यांशी जुळते का ते पाहायचे आहे का?",
    aiQProcessing: "NOVA म्हणजे काय हे जाणून घ्यायचे आहे का?",
    aiQScore: "Nutri-Score म्हणजे काय हे जाणून घ्यायचे आहे का?",
    aiQData: "हा निकाल किती विश्वासार्ह आहे हे जाणून घ्यायचे आहे का?",
    yes: "होय",
    no: "नाही",
    noContext: "आधी एखादे उत्पादन स्कॅन करा, मग KIACHE त्या निकालाबद्दल सांगू शकेल.",
    reliable: "विश्वासार्हता आधी",
    dictionaryNav: "शब्दकोश",
    compareNav: "तुलना",
    quickInsight: "त्वरित माहिती",
    kiacheSnapshot: "तुमचा KIACHE आढावा",
    dictionaryEyebrow: "KIACHE / शब्दकोश",
    dictionaryTitle: "घटक शब्दकोश.",
    dictionaryDesc: "घटकाचे नाव, E-नंबर किंवा INS नंबरने शोधा (उदा. \"E322\", \"INS 322\", \"lecithin\", \"sucralose\").",
    compareEyebrow: "KIACHE / तुलना",
    compareTitle: "तुमच्यासाठी कोणते चांगले आहे?",
    compareDesc: "बाजूबाजूला तुलना पाहण्यासाठी दोन बारकोड टाका (किंवा खालील उदाहरण निवडा)."
  }
};

export const allergenOptions = [
  "Peanuts",
  "Tree nuts",
  "Milk",
  "Egg",
  "Soy",
  "Wheat / gluten",
  "Sesame",
  "Fish",
  "Shellfish"
];

export const prefs = [
  "Lower sugar",
  "Simple ingredients",
  "Plant-forward",
  "More protein"
];

export const comparePriorities = [
  "Lower sugar",
  "Higher protein",
  "Higher fibre",
  "Lower sodium",
  "Fewer sweeteners",
  "Fewer additives",
  "Lower calories"
];

export const ingredientKnowledge: Record<string, IngredientEntry> = {
  sugar: {
    key: "sugar",
    label: "Added sugars",
    category: "Sweetener",
    why: "Adds sweetness and energy. Several sugar names can appear separately on a label.",
    watch: "Compare total sugars, added-sugar information when available, and serving size.",
    eli5: "This is a form of sugar that makes food taste sweet and gives quick energy.",
    scientist: "A simple or disaccharide carbohydrate (e.g. sucrose, dextrose) added during formulation to modulate sweetness, texture, browning and preservation."
  },
  salt: {
    key: "salt",
    label: "Salt / sodium",
    category: "Other",
    why: "Used for flavour and preservation. Sodium is an essential nutrient, but too much can be a concern for some people.",
    watch: "Look at sodium per serving and consider the portion you actually eat.",
    eli5: "Common table salt that brings out flavour and helps preserve packaged food.",
    scientist: "Sodium chloride (NaCl), providing ionic strength, water-activity reduction, and taste enhancement."
  },
  palm: {
    key: "palm",
    label: "Palm oil",
    category: "Oils and fats",
    why: "A common plant fat used for texture and stability. Its presence alone does not establish that a food is unsafe.",
    watch: "Consider the overall saturated-fat amount and the rest of the product.",
    eli5: "A vegetable oil that stays semi-solid at room temperature, giving snacks and spreads a smooth texture.",
    scientist: "An edible plant oil rich in palmitic and oleic fatty acids, valued for oxidative stability and solid fat index without hydrogenation."
  },
  hydrogenated: {
    key: "hydrogenated",
    label: "Hydrogenated oil",
    category: "Oils and fats",
    why: "Hydrogenation can change the properties of an oil. Fully and partially hydrogenated oils are not identical, so the exact label wording matters.",
    watch: "Check the nutrition panel and the exact ingredient wording.",
    eli5: "Liquid vegetable oil treated to stay solid at room temperature for shelf life and texture.",
    scientist: "Catalytic addition of hydrogen to unsaturated fatty acid double bonds; partial hydrogenation can generate trans isomers whereas full hydrogenation yields saturated stearic/palmitic esters."
  },
  maltodextrin: {
    key: "maltodextrin",
    label: "Maltodextrin",
    category: "Starches",
    why: "A starch-derived carbohydrate commonly used for texture, bulk or processing.",
    watch: "It can contribute carbohydrate without tasting very sweet.",
    eli5: "A powder made from starch that adds body to food without much sweetness.",
    scientist: "A glucose polymer (DE 3–20) produced by partial hydrolysis of starch, used as a bulking agent, carrier or texturiser."
  },
  lecithin: {
    key: "lecithin",
    label: "Lecithin",
    category: "Emulsifiers",
    eNumber: "E322",
    insNumber: "322",
    why: "An emulsifier that helps ingredients such as water and oil stay mixed. It can come from sources including soy or sunflower.",
    watch: "If allergies matter, check the source listed on the package.",
    eli5: "It's what keeps oil and water from separating in your food, like in chocolate or bread.",
    scientist: "A phospholipid-rich mixture that acts as a surfactant, reducing interfacial tension between hydrophilic and lipophilic phases."
  },
  citric: {
    key: "citric",
    label: "Citric acid",
    category: "Acidity regulators",
    eNumber: "E330",
    insNumber: "330",
    why: "An acidulant used for tartness, acidity control and preservation. It is also naturally present in many fruits.",
    watch: "The name alone does not indicate that the product is harmful.",
    eli5: "It's the sour, tangy ingredient also found naturally in lemons and oranges.",
    scientist: "A tricarboxylic acid used to adjust pH, chelate metal ions and act as a mild preservative and flavour enhancer."
  },
  ascorbic: {
    key: "ascorbic",
    label: "Ascorbic acid",
    category: "Antioxidants",
    eNumber: "E300",
    insNumber: "300",
    why: "Vitamin C in a form often used for fortification or to limit oxidation.",
    watch: "It is a familiar food ingredient; the amount and purpose matter.",
    eli5: "This is vitamin C — it keeps food fresh and can also add nutrition.",
    scientist: "An antioxidant that scavenges reactive oxygen species and retards oxidative browning and rancidity."
  },
  inulin: {
    key: "inulin",
    label: "Inulin / chicory fibre",
    category: "Fibres",
    why: "A fermentable dietary fibre used in some foods to increase fibre content or improve texture.",
    watch: "Some people find large amounts cause digestive discomfort.",
    eli5: "A plant fibre often extracted from chicory root to boost fibre and creaminess.",
    scientist: "A fructan polysaccharide composed of fructose chains terminated by glucose, fermented by colonic microbiota."
  },
  gums: {
    key: "gums",
    label: "Food gums",
    category: "Thickeners",
    eNumber: "E412 / E415",
    insNumber: "412 / 415",
    why: "Ingredients such as xanthan or guar gum can thicken or stabilize foods.",
    watch: "They are used in small amounts; individual tolerance can vary.",
    eli5: "Plant or fermentation-based thickeners that keep sauces, dressings and batters smooth.",
    scientist: "High-molecular-weight hydrocolloid polysaccharides that increase viscosity and inhibit phase separation."
  },
  colour: {
    key: "colour",
    label: "Added colour",
    category: "Colours",
    why: "Food colours are used to make or restore a consistent appearance.",
    watch: "The specific colour and local regulations matter more than the generic word 'colour'."
  },
  sucralose: {
    key: "sucralose",
    label: "Sucralose",
    category: "Sweetener",
    eNumber: "E955",
    insNumber: "955",
    why: "A non-nutritive sweetener made from sugar, used to provide sweetness with little to no calories or conventional sugar.",
    watch: "Check the amount and how many different sweeteners are combined in one product.",
    eli5: "It tastes very sweet but has almost no calories, so it's often used instead of sugar.",
    scientist: "A chlorinated sucrose derivative that is roughly 600× sweeter than sucrose and largely resistant to metabolism."
  },
  aspartame: {
    key: "aspartame",
    label: "Aspartame",
    category: "Sweetener",
    eNumber: "E951",
    insNumber: "951",
    why: "A widely used non-nutritive sweetener. People with the rare condition phenylketonuria (PKU) need to avoid phenylalanine, so labels often carry a specific warning.",
    watch: "Look for a phenylalanine warning if this applies to you.",
    eli5: "A very sweet ingredient used in tiny amounts instead of sugar.",
    scientist: "A dipeptide methyl ester (aspartyl-phenylalanine methyl ester), ~200× sweeter than sucrose, metabolised into phenylalanine, aspartic acid and methanol at low levels."
  },
  acesulfameK: {
    key: "acesulfameK",
    label: "Acesulfame potassium (Ace-K)",
    category: "Sweetener",
    eNumber: "E950",
    insNumber: "950",
    why: "A non-nutritive sweetener often combined with other sweeteners to balance taste.",
    watch: "Frequently appears alongside sucralose or aspartame in 'zero sugar' products.",
    eli5: "A sugar-free sweetener that's often mixed with others to make the taste more balanced.",
    scientist: "A potassium salt of an oxathiazinone dioxide, heat-stable and commonly blended synergistically with other high-intensity sweeteners."
  },
  saccharin: {
    key: "saccharin",
    label: "Saccharin",
    category: "Sweetener",
    eNumber: "E954",
    insNumber: "954",
    why: "One of the oldest artificial sweeteners, used in small amounts for sweetness without sugar.",
    watch: "Can have a noticeable aftertaste at higher concentrations.",
    eli5: "An old-school sugar substitute that's very sweet in tiny amounts."
  },
  steviolGlycosides: {
    key: "steviolGlycosides",
    label: "Steviol glycosides (stevia)",
    category: "Sweetener",
    eNumber: "E960",
    insNumber: "960",
    why: "A plant-derived sweetener extracted from the stevia leaf.",
    watch: "Often blended with sugar alcohols to soften its aftertaste.",
    eli5: "A sweetener made from a plant called stevia instead of a lab-made chemical.",
    scientist: "A group of diterpene glycosides extracted from Stevia rebaudiana leaves, non-caloric and heat-stable."
  },
  erythritol: {
    key: "erythritol",
    label: "Erythritol",
    category: "Sweetener (sugar alcohol)",
    eNumber: "E968",
    insNumber: "968",
    why: "A sugar alcohol that provides sweetness with minimal calories; largely absorbed and excreted unchanged.",
    watch: "Generally well tolerated, though very large amounts can affect some people's digestion.",
    eli5: "A sugar-like ingredient your body mostly doesn't absorb, so it adds little energy."
  },
  xylitol: {
    key: "xylitol",
    label: "Xylitol",
    category: "Sweetener (sugar alcohol)",
    eNumber: "E967",
    insNumber: "967",
    why: "A sugar alcohol common in sugar-free gum and mints.",
    watch: "Large amounts can have a laxative effect in some people. It is toxic to dogs — keep such products away from pets."
  },
  sorbitol: {
    key: "sorbitol",
    label: "Sorbitol",
    category: "Sweetener (sugar alcohol)",
    eNumber: "E420",
    insNumber: "420",
    why: "A sugar alcohol used for sweetness and to retain moisture.",
    watch: "Consuming a lot at once can cause digestive discomfort in some people."
  },
  maltitol: {
    key: "maltitol",
    label: "Maltitol",
    category: "Sweetener (sugar alcohol)",
    eNumber: "E965",
    insNumber: "965",
    why: "A sugar alcohol commonly used in sugar-free chocolate and confectionery.",
    watch: "Can have a laxative effect in larger amounts."
  },
  monkFruit: {
    key: "monkFruit",
    label: "Monk fruit extract",
    category: "Sweetener",
    why: "A non-caloric sweetener derived from the monk fruit (luo han guo).",
    watch: "Often blended with other sweeteners; check the full ingredient list."
  },
  msg: {
    key: "msg",
    label: "Monosodium glutamate (MSG)",
    category: "Flavour enhancer",
    eNumber: "E621",
    insNumber: "621",
    why: "A flavour enhancer that amplifies savoury (umami) taste. It is the sodium salt of glutamic acid, an amino acid found naturally in many foods like tomatoes and cheese.",
    watch: "Major food-safety authorities including FSSAI and WHO/FAO's JECFA consider MSG safe for the general population at normal use levels; some people report individual sensitivity.",
    eli5: "It's an ingredient that makes savoury food taste richer — the same kind of taste-building block found naturally in cheese and tomatoes.",
    scientist: "The sodium salt of L-glutamic acid; glutamate receptors on the tongue mediate umami taste perception."
  },
  sodiumBenzoate: {
    key: "sodiumBenzoate",
    label: "Sodium benzoate",
    category: "Preservatives",
    eNumber: "E211",
    insNumber: "211",
    why: "A preservative used to prevent the growth of mould, yeast and some bacteria, mainly in acidic foods and drinks.",
    watch: "Regulated maximum usage levels apply; the amount matters more than the presence alone."
  },
  potassiumSorbate: {
    key: "potassiumSorbate",
    label: "Potassium sorbate",
    category: "Preservatives",
    eNumber: "E202",
    insNumber: "202",
    why: "A widely used preservative that inhibits mould and yeast growth, extending shelf life.",
    watch: "Considered one of the milder, well-studied preservatives."
  },
  bakingSoda: {
    key: "bakingSoda",
    label: "Sodium bicarbonate (baking soda)",
    category: "Raising agents",
    eNumber: "E500",
    insNumber: "500",
    why: "A raising agent that releases carbon dioxide to help baked goods rise.",
    watch: "Contributes some sodium to the final product."
  },
  tartrazine: {
    key: "tartrazine",
    label: "Tartrazine",
    category: "Colours",
    eNumber: "E102",
    insNumber: "102",
    why: "A synthetic yellow food colour.",
    watch: "A small number of people report sensitivity; regulated usage limits apply in most markets."
  }
};

export const dictionaryCategories = [
  "All",
  "Sweetener",
  "Sweetener (sugar alcohol)",
  "Preservatives",
  "Emulsifiers",
  "Acidity regulators",
  "Antioxidants",
  "Colours",
  "Thickeners",
  "Fibres",
  "Starches",
  "Flavour enhancer",
  "Raising agents",
  "Oils and fats",
  "Other"
];

export const sweetenerKeys = [
  "sucralose",
  "aspartame",
  "acesulfameK",
  "saccharin",
  "steviolGlycosides",
  "erythritol",
  "xylitol",
  "sorbitol",
  "maltitol",
  "monkFruit"
];

export const sampleProducts: Record<string, OpenFoodFactsProduct> = {
  "8901058851419": {
    code: "8901058851419",
    product_name: "Maggi 2-Minute Masala Noodles",
    brands: "Nestlé",
    quantity: "70 g",
    ingredients_text: "Refined wheat flour (Maida), Palm oil, Iodised salt, Wheat gluten, Thickeners (508 & 412), Acidity regulators (501(i) & 500(i)), Humectant (451(i)), Mixed spices, Hydrolysed groundnut protein, Sugar, Starch, Citric acid (330), Flavour enhancer (635).",
    nutriscore_grade: "d",
    nova_group: 4,
    additives_tags: ["en:e412", "en:e500", "en:e501", "en:e451", "en:e330", "en:e635"],
    allergens_tags: ["en:gluten", "en:peanuts"],
    traces_tags: ["en:milk", "en:mustard", "en:soybeans"],
    nutrient_levels: {
      sugars: "low",
      fat: "moderate",
      "saturated-fat": "high",
      salt: "high"
    },
    nutriments: {
      "energy-kcal_100g": 427,
      proteins_100g: 8.2,
      sugars_100g: 1.5,
      fiber_100g: 3.6,
      sodium_100g: 1.18
    },
    categories: "Instant noodles"
  },
  "3017620422003": {
    code: "3017620422003",
    product_name: "Nutella Hazelnut Spread with Cocoa",
    brands: "Ferrero",
    quantity: "400 g",
    ingredients_text: "Sugar, palm oil, hazelnuts (13%), skimmed milk powder (8.7%), fat-reduced cocoa (7.4%), emulsifier: lecithins (soya) (E322), vanillin.",
    nutriscore_grade: "e",
    nova_group: 4,
    additives_tags: ["en:e322"],
    allergens_tags: ["en:nuts", "en:milk", "en:soybeans"],
    traces_tags: [],
    nutrient_levels: {
      sugars: "high",
      fat: "high",
      "saturated-fat": "high",
      salt: "low"
    },
    nutriments: {
      "energy-kcal_100g": 539,
      proteins_100g: 6.3,
      sugars_100g: 56.3,
      fiber_100g: 3.4,
      sodium_100g: 0.04
    },
    categories: "Sweet spreads, Hazelnut spreads"
  },
  "5449000000996": {
    code: "5449000000996",
    product_name: "Coca-Cola Zero Sugar Sparkling Beverage",
    brands: "Coca-Cola",
    quantity: "330 ml",
    ingredients_text: "Carbonated water, colour (caramel E150d), acid (phosphoric acid), sweeteners (aspartame E951, acesulfame K E950), natural flavourings, acidity regulator (sodium citrates).",
    nutriscore_grade: "b",
    nova_group: 4,
    additives_tags: ["en:e150d", "en:e338", "en:e950", "en:e951", "en:e331"],
    allergens_tags: [],
    traces_tags: [],
    nutrient_levels: {
      sugars: "low",
      fat: "low",
      "saturated-fat": "low",
      salt: "low"
    },
    nutriments: {
      "energy-kcal_100g": 0.3,
      proteins_100g: 0,
      sugars_100g: 0,
      fiber_100g: 0,
      sodium_100g: 0.01
    },
    categories: "Diet sodas, Zero sugar colas",
    labels: "Zero sugar, No sugar"
  },
  "8901063141124": {
    code: "8901063141124",
    product_name: "NutriChoice Hi-Fibre Digestive Biscuits",
    brands: "Britannia",
    quantity: "250 g",
    ingredients_text: "Refined wheat flour, Whole wheat flour (25%), Palm oil, Sugar, Wheat bran (5.5%), Invert sugar syrup, Raising agents (500(ii), 503(ii)), Iodised salt, Milk solids, Emulsifiers (322, 471), Malt extract, Citric acid (330).",
    nutriscore_grade: "c",
    nova_group: 4,
    additives_tags: ["en:e322", "en:e330", "en:e471", "en:e500", "en:e503"],
    allergens_tags: ["en:gluten", "en:milk", "en:soybeans"],
    traces_tags: ["en:nuts"],
    nutrient_levels: {
      sugars: "moderate",
      fat: "moderate",
      "saturated-fat": "high",
      salt: "moderate"
    },
    nutriments: {
      "energy-kcal_100g": 478,
      proteins_100g: 7.5,
      sugars_100g: 16.5,
      fiber_100g: 6.2,
      sodium_100g: 0.38
    },
    categories: "Digestive biscuits"
  }
};

export const demoLabels: { id: string; title: string; subtitle: string; text: string }[] = [
  {
    id: "oat-bar",
    title: "Golden Oat Crunch Bar",
    subtitle: "Oats, soy lecithin, milk powder, 10g sugars",
    text: "Golden Oat Crunch Bar\nIngredients: whole grain oats, sugar, cocoa powder, sunflower oil, milk powder, salt, soy lecithin, natural flavour.\nNutrition per serving: Energy 210 kcal; Protein 6 g; Carbohydrate 28 g; Sugars 10 g; Fat 8 g; Fibre 4 g; Sodium 120 mg."
  },
  {
    id: "zero-drink",
    title: "Zero Sugar Citrus Sparkler",
    subtitle: "Sucralose + Ace-K sweetener swap demo",
    text: "Zero Sugar Citrus Sparkler\nIngredients: carbonated water, citric acid, natural citrus flavour, sucralose, acesulfame potassium, ascorbic acid, sodium benzoate, potassium sorbate.\nNutrition per serving: Energy 4 kcal; Protein 0 g; Carbohydrate 0 g; Sugars 0 g; Fat 0 g; Fibre 0 g; Sodium 35 mg."
  },
  {
    id: "savory-crisps",
    title: "Tangy Masala Lentil Crisps",
    subtitle: "MSG (E621), maltodextrin, palm oil, peanut trace",
    text: "Tangy Masala Lentil Crisps\nIngredients: lentil flour, palm oil, maltodextrin, salt, sugar, monosodium glutamate (E621), citric acid, peanut oil, tartrazine colour, xanthan gum.\nNutrition per serving: Energy 165 kcal; Protein 5 g; Carbohydrate 18 g; Sugars 2 g; Fat 9 g; Fibre 3 g; Sodium 340 mg."
  }
];

export function normalizeSearchTerm(s: string): string {
  return (s || "").toLowerCase().trim().replace(/^ins\s*/, "").replace(/^e[\s-]?/, "");
}

export function ingredientMatchesQuery(key: string, entry: IngredientEntry, q: string): boolean {
  if (!q) return true;
  const nq = normalizeSearchTerm(q);
  const rawQ = q.toLowerCase().trim();
  const fields = [key, entry.label, entry.eNumber || "", entry.insNumber || "", entry.category || ""].join(" ").toLowerCase();
  if (fields.includes(rawQ)) return true;
  if (entry.eNumber && normalizeSearchTerm(entry.eNumber) === nq) return true;
  if (entry.insNumber && entry.insNumber === nq) return true;
  return false;
}

export function parseIngredientFlags(text: string): IngredientEntry[] {
  const lower = (text || "").toLowerCase();
  const flags: IngredientEntry[] = [];
  const add = (key: string, term: string) => {
    if (lower.includes(term) && ingredientKnowledge[key]) {
      flags.push(ingredientKnowledge[key]);
    }
  };
  add("sugar", "sugar");
  add("sugar", "dextrose");
  add("sugar", "maltose");
  add("sugar", "glucose syrup");
  add("maltodextrin", "maltodextrin");
  add("palm", "palm oil");
  add("hydrogenated", "hydrogenated");
  add("lecithin", "lecithin");
  add("citric", "citric acid");
  add("ascorbic", "ascorbic acid");
  add("inulin", "inulin");
  add("inulin", "chicory");
  add("colour", "colour");
  add("colour", "color");
  add("sucralose", "sucralose");
  add("aspartame", "aspartame");
  add("acesulfameK", "acesulfame");
  add("saccharin", "saccharin");
  add("steviolGlycosides", "stevia");
  add("steviolGlycosides", "steviol");
  add("erythritol", "erythritol");
  add("xylitol", "xylitol");
  add("sorbitol", "sorbitol");
  add("maltitol", "maltitol");
  add("monkFruit", "monk fruit");
  add("msg", "monosodium glutamate");
  if (/\be\s?621\b|\bins\s?621\b/i.test(text)) {
    flags.push(ingredientKnowledge.msg);
  }
  add("sodiumBenzoate", "sodium benzoate");
  add("potassiumSorbate", "potassium sorbate");
  add("tartrazine", "tartrazine");
  if (/xanthan gum|guar gum|cellulose gum|\b412\b|\b415\b/i.test(text)) {
    flags.push(ingredientKnowledge.gums);
  }
  return [...new Map(flags.filter(Boolean).map((x) => [x.label, x])).values()];
}

export function detectSweetenerSwap(claimText: string, ingredientText: string): { claimHit: boolean; sweeteners: IngredientEntry[] } | null {
  const claimHit = /(zero sugar|sugar[\s-]?free|no added sugar|diet\b|\blight\b|\blite\b|low sugar)/i.test(claimText || "");
  if (!claimHit) return null;
  const lower = (ingredientText || "").toLowerCase();
  const found = sweetenerKeys
    .map((k) => ingredientKnowledge[k])
    .filter((v) => {
      const firstWord = v.label.toLowerCase().split(" ")[0].replace(/\(.*/, "").trim();
      return lower.includes(firstWord);
    });
  return { claimHit, sweeteners: found };
}

export function extractName(text: string): string {
  return (
    (text || "")
      .split(/\n/)
      .map((x) => x.trim())
      .find(
        (x) =>
          x.length >= 3 &&
          x.length <= 80 &&
          !/^ingredients?|nutrition|energy|protein|carbohydrate|sugars?|fat|fibre|fiber|sodium/i.test(x)
      ) || "Scanned food label"
  );
}

export function extractNumber(text: string, re: RegExp): number | null {
  const m = (text || "").match(re);
  return m ? Number(m[1]) : null;
}

export function sweetenerCount(ingredientsText?: string): number {
  const lower = (ingredientsText || "").toLowerCase();
  return sweetenerKeys.filter((k) => {
    const firstWord = ingredientKnowledge[k].label.toLowerCase().split(" ")[0];
    return lower.includes(firstWord);
  }).length;
}

export function answerFreeTextQuestion(
  q: string,
  chatExplainMode: 'eli5' | 'scientist',
  lastContext: LastScanContext | null
): string {
  const lower = q.toLowerCase();
  if (/compare/.test(lower)) {
    return "Head to Compare products (the Compare tab in the navigation) and enter two barcodes — KIACHE will lay out the nutrients side by side and won't declare one universal winner.";
  }
  if (/portion|how much (of this )?should i eat|serving size/.test(lower)) {
    if (lastContext?.product?.nutriments || lastContext?.sugar != null) {
      return "KIACHE can show typical serving information from the label, but it doesn't have enough information to confidently prescribe a personal portion. Use the serving size on the package as a starting point, and consider your own goals and any advice from a healthcare professional.";
    }
    return "Scan a product first, then ask this again — KIACHE will reference its serving-size information where available.";
  }
  for (const [key, entry] of Object.entries(ingredientKnowledge)) {
    const firstWord = entry.label.toLowerCase().split(" ")[0].replace(/\(.*/, "").trim();
    if (ingredientMatchesQuery(key, entry, lower) || lower.includes(firstWord)) {
      const long = chatExplainMode === "scientist" ? entry.scientist || entry.why : entry.eli5 || entry.why;
      return `${entry.label}${entry.eNumber ? ` (${entry.eNumber})` : ""}: ${long}${entry.watch ? " · Worth knowing: " + entry.watch : ""}`;
    }
  }
  if (lastContext && /allerg/.test(lower)) {
    return lastContext.allergyHits?.length
      ? `Your selected allergy preferences matched: ${lastContext.allergyHits.join(", ")}. Always check the physical package if a serious allergy is involved.`
      : "No selected allergy preference matched this result's text — that isn't a guarantee of absence, though.";
  }
  if (lastContext && /suitable|diet|vegan|vegetarian|halal|jain/.test(lower)) {
    return "KIACHE can't certify dietary suitability. Check the ingredient list above for animal-derived items and look for an official certification mark on the package.";
  }
  return "I don't have enough information to determine that from what KIACHE has read so far. Try naming a specific ingredient, an E-number (like E322 or E621), or scan a product first for more specific answers.";
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  ScanLine,
  History,
  BookOpen,
  ArrowLeftRight,
  Settings,
  HelpCircle,
  X,
  Star,
  Trash2,
  Camera,
  Upload,
  Sparkles,
  Search,
  ChevronRight,
  RefreshCw,
  Check,
  AlertTriangle,
  Globe
} from 'lucide-react';
import {
  LanguageCode,
  OpenFoodFactsProduct,
  ScanHistoryItem,
  LastScanContext,
  facts,
  i18n,
  allergenOptions,
  prefs,
  comparePriorities,
  ingredientKnowledge,
  dictionaryCategories,
  sweetenerKeys,
  sampleProducts,
  demoLabels,
  ingredientMatchesQuery,
  parseIngredientFlags,
  detectSweetenerSwap,
  extractName,
  extractNumber,
  sweetenerCount,
  answerFreeTextQuestion
} from './data/kiacheData';

declare global {
  interface Window {
    Tesseract?: {
      recognize: (
        image: File | Blob | string,
        lang: string,
        options?: { logger?: (m: { progress?: number; status?: string }) => void }
      ) => Promise<{ data: { text: string } }>;
    };
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
    };
  }
}

type PageId = 'home' | 'scan' | 'dictionary' | 'compare' | 'history' | 'settings';

const INITIAL_HISTORY: ScanHistoryItem[] = [
  {
    id: 'seed-1',
    type: 'barcode',
    code: '5449000000996',
    product: sampleProducts['5449000000996'],
    name: 'Coca-Cola Zero Sugar Sparkling Beverage',
    date: 'Today · Sample scan',
    score: 'NOVA 4: ultra-processed',
    favorite: true
  },
  {
    id: 'seed-2',
    type: 'photo',
    rawText: demoLabels[0].text,
    name: 'Golden Oat Crunch Bar',
    date: 'Today · Demo label read',
    score: 'Label read',
    favorite: false
  }
];

function MascotTrack({ small = false }: { small?: boolean }) {
  return (
    <div className={`relative overflow-hidden my-1.5 ${small ? 'h-12' : 'h-14'} w-64 mx-auto`}>
      <div className="absolute bottom-0.5 left-0 animate-mascot-move">
        <svg
          width={small ? 38 : 44}
          height={small ? 38 : 44}
          viewBox="0 0 46 46"
          className="block animate-mascot-hop"
        >
          <circle cx="23" cy="23" r="21" fill="#6A4C93" />
          <circle cx="16" cy="20" r="2.4" fill="#fff" />
          <circle cx="30" cy="20" r="2.4" fill="#fff" />
          <path
            d="M14 29c3 4 15 4 18 0"
            stroke="#fff"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('kiacheEntered') === '0';
  });
  const [activePage, setActivePage] = useState<PageId>('home');

  const [lang, setLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('kiacheLang') as LanguageCode;
    return saved && ['en', 'hi', 'bn', 'mr'].includes(saved) ? saved : 'en';
  });
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('kiacheName') || '');
  const [nameInput, setNameInput] = useState<string>(() => localStorage.getItem('kiacheName') || '');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('kiachePrefs') || '["Simple ingredients"]');
    } catch {
      return ['Simple ingredients'];
    }
  });
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('kiacheAllergens') || '["Peanuts"]');
    } catch {
      return ['Peanuts'];
    }
  });
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('kiacheHistory') || 'null');
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  // Fact index
  const [factIndex, setFactIndex] = useState<number>(() => Math.floor(Date.now() / 86400000) % facts.length);

  // Scanner state
  const [scanMode, setScanMode] = useState<'barcode' | 'photo'>('barcode');
  const [barcodeInput, setBarcodeInput] = useState<string>('8901058851419');
  const [productSearchInput, setProductSearchInput] = useState<string>('');
  const [barcodeStatus, setBarcodeStatus] = useState<string>('');
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[] | null>(null);
  const [currentBarcodeResult, setCurrentBarcodeResult] = useState<{
    product: OpenFoodFactsProduct;
    code: string;
  } | null>(() => ({
    product: sampleProducts['8901058851419'],
    code: '8901058851419'
  }));

  // Photo OCR state
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [currentPhotoText, setCurrentPhotoText] = useState<string | null>(demoLabels[0].text);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [barcodeCameraActive, setBarcodeCameraActive] = useState<boolean>(false);
  const [scanFeedbackText, setScanFeedbackText] = useState<string>('Ready to scan');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const barcodeVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const barcodeStreamRef = useRef<MediaStream | null>(null);
  const barcodeLoopRef = useRef<number | null>(null);

  // Dictionary state
  const [dictSearch, setDictSearch] = useState<string>('');
  const [dictCategory, setDictCategory] = useState<string>('All');
  const [dictSciMode, setDictSciMode] = useState<boolean>(false);

  // Compare state
  const [compareCodeA, setCompareCodeA] = useState<string>('8901063141124');
  const [compareCodeB, setCompareCodeB] = useState<string>('3017620422003');
  const [compareSelectedPriorities, setCompareSelectedPriorities] = useState<string[]>([
    'Lower sugar',
    'Higher fibre'
  ]);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);
  const [compareProducts, setCompareProducts] = useState<{
    a: OpenFoodFactsProduct | null;
    b: OpenFoodFactsProduct | null;
  }>({
    a: sampleProducts['8901063141124'],
    b: sampleProducts['3017620422003']
  });

  // History state
  const [historyFavOnly, setHistoryFavOnly] = useState<boolean>(false);
  const [confirmClearHistory, setConfirmClearHistory] = useState<boolean>(false);

  // Guided Q&A Chat state
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatExplainMode, setChatExplainMode] = useState<'eli5' | 'scientist'>('eli5');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<
    { id: string; role: 'bot' | 'user' | 'guided-q' | 'guided-a'; text: string }[]
  >([]);

  // Last scan context for Q&A
  const [lastScanContext, setLastScanContext] = useState<LastScanContext | null>(() => ({
    name: sampleProducts['8901058851419'].product_name || 'Maggi 2-Minute Masala Noodles',
    product: sampleProducts['8901058851419'],
    ingredients: sampleProducts['8901058851419'].ingredients_text,
    flags: parseIngredientFlags(sampleProducts['8901058851419'].ingredients_text || ''),
    allergyHits: ['Peanuts', 'Wheat / gluten']
  }));

  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2600);
  };

  const t = (key: string): string => {
    return (i18n[lang] && i18n[lang][key]) || i18n.en[key] || key;
  };

  // Persist state
  useEffect(() => {
    localStorage.setItem('kiacheLang', lang);
    localStorage.setItem('kiacheName', userName);
    localStorage.setItem('kiachePrefs', JSON.stringify(selectedPrefs));
    localStorage.setItem('kiacheAllergens', JSON.stringify(selectedAllergens));
    localStorage.setItem('kiacheHistory', JSON.stringify(history));
  }, [lang, userName, selectedPrefs, selectedAllergens, history]);

  // Stop camera when leaving scan page
  useEffect(() => {
    if (activePage !== 'scan') {
      stopPhotoCamera();
      stopBarcodeCamera();
    }
  }, [activePage]);

  const navigateTo = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const togglePref = (pref: string) => {
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  // Allergen matching helper
  const computeAllergyHits = (textToScan: string): string[] => {
    const lower = (textToScan || '').toLowerCase();
    return selectedAllergens.filter((a) => {
      const terms = a
        .toLowerCase()
        .replace(' / gluten', ' gluten wheat')
        .split(/[^a-z]+/)
        .filter(Boolean);
      return terms.some((term) => lower.includes(term));
    });
  };

  // Barcode Lookup
  const handleLookupBarcode = async (rawCode: string, saveToHist = true) => {
    const code = (rawCode || '').replace(/\D/g, '');
    if (!code) {
      showToast('Enter a barcode number first');
      return;
    }
    setBarcodeInput(code);
    setSearchResults(null);

    setBarcodeStatus('Checking public food sources…');
    try {
      const fields =
        'product_name,brands,image_front_small_url,ingredients_text,nutriscore_grade,nova_group,additives_tags,allergens_tags,traces_tags,nutrient_levels,quantity,nutriments,categories,labels';
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && data.product) {
          setBarcodeStatus('');
          applyBarcodeProduct(data.product, code, saveToHist);
          return;
        }
      }
      if (sampleProducts[code]) {
        setBarcodeStatus('');
        applyBarcodeProduct(sampleProducts[code], code, saveToHist);
        return;
      }
      setBarcodeStatus('');
      setCurrentBarcodeResult(null);
      showToast('No verified barcode record found');
    } catch {
      if (sampleProducts[code]) {
        setBarcodeStatus('');
        applyBarcodeProduct(sampleProducts[code], code, saveToHist);
        return;
      }
      setBarcodeStatus('Offline / database unreachable — try a sample barcode or read the label photo.');
    }
  };

  const applyBarcodeProduct = (p: OpenFoodFactsProduct, code: string, saveToHist: boolean) => {
    setCurrentBarcodeResult({ product: p, code });
    const ingredients = p.ingredients_text || '';
    const allergyHits = computeAllergyHits(
      `${ingredients} ${(p.allergens_tags || []).join(' ')}`
    );
    const ingredientFlags = parseIngredientFlags(ingredients);
    const nova = Number(p.nova_group) || null;

    setLastScanContext({
      name: p.product_name || `Product ${code}`,
      product: p,
      ingredients,
      flags: ingredientFlags,
      allergyHits
    });

    if (saveToHist) {
      const newEntry: ScanHistoryItem = {
        id: `scan-${Date.now()}`,
        type: 'barcode',
        code,
        product: p,
        name: p.product_name || `Product ${code}`,
        date: new Date().toLocaleString(),
        score: allergyHits.length
          ? 'Allergy match'
          : nova === 4
          ? 'NOVA 4: ultra-processed'
          : 'Product read',
        favorite: false
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 29)]);
    }
    showToast('Product decoded');
  };

  const handleSearchProduct = async (query: string) => {
    const q = (query || '').trim();
    if (!q) {
      showToast('Enter a food, brand or ingredient to search');
      return;
    }
    setBarcodeStatus('Searching product names and ingredients…');
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        q
      )}&search_simple=1&action=process&json=1&page_size=6&fields=code,product_name,brands,image_front_small_url,ingredients_text,nutriscore_grade,nova_group,additives_tags,allergens_tags,traces_tags,nutrient_levels,quantity,nutriments,categories,labels`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('network');
      const data = await res.json();
      setBarcodeStatus('');
      if (data.products && data.products.length > 0) {
        setSearchResults(data.products.slice(0, 6));
      } else {
        const localMatches = Object.values(sampleProducts).filter((sp) =>
          `${sp.product_name} ${sp.brands} ${sp.ingredients_text}`
            .toLowerCase()
            .includes(q.toLowerCase())
        );
        setSearchResults(localMatches);
      }
    } catch {
      setBarcodeStatus('');
      const localMatches = Object.values(sampleProducts).filter((sp) =>
        `${sp.product_name} ${sp.brands} ${sp.ingredients_text}`
          .toLowerCase()
          .includes(q.toLowerCase())
      );
      setSearchResults(localMatches.length ? localMatches : Object.values(sampleProducts));
      showToast('Showing curated matches');
    }
  };

  // Barcode Camera
  const startBarcodeCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Camera is not available in this browser.');
      return;
    }
    if (!('BarcodeDetector' in window) || !window.BarcodeDetector) {
      showToast("Live barcode detection isn't supported in this browser. Type or pick a barcode instead.");
      return;
    }
    try {
      stopPhotoCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      barcodeStreamRef.current = stream;
      setBarcodeCameraActive(true);
      setBarcodeStatus('Point the camera at a barcode…');

      setTimeout(async () => {
        if (barcodeVideoRef.current) {
          barcodeVideoRef.current.srcObject = stream;
          await barcodeVideoRef.current.play().catch(() => {});
          if (window.BarcodeDetector) {
            const detector = new window.BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']
            });
            barcodeLoopRef.current = window.setInterval(async () => {
              try {
                if (!barcodeVideoRef.current) return;
                const codes = await detector.detect(barcodeVideoRef.current);
                if (codes.length > 0) {
                  const rawCode = codes[0].rawValue;
                  stopBarcodeCamera();
                  handleLookupBarcode(rawCode, true);
                }
              } catch {
                // ignore frame errors
              }
            }, 500);
          }
        }
      }, 100);
    } catch {
      showToast('Camera access is unavailable. Type the barcode instead.');
    }
  };

  const stopBarcodeCamera = () => {
    if (barcodeLoopRef.current) {
      window.clearInterval(barcodeLoopRef.current);
      barcodeLoopRef.current = null;
    }
    if (barcodeStreamRef.current) {
      barcodeStreamRef.current.getTracks().forEach((t) => t.stop());
      barcodeStreamRef.current = null;
    }
    setBarcodeCameraActive(false);
  };

  // Photo Camera & OCR
  const startPhotoCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Camera access is unavailable. Use Choose label photo instead.');
      return;
    }
    try {
      stopBarcodeCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      cameraStreamRef.current = stream;
      setCameraActive(true);
      setScanFeedbackText('Steady… keep the label inside the frame');
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setScanFeedbackText('Ready to capture');
        }
      }, 150);
      showToast('Camera ready');
    } catch {
      showToast('Camera access is unavailable. Use Choose label photo instead.');
    }
  };

  const stopPhotoCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
    setScanFeedbackText('Ready to scan');
  };

  const capturePhotoFrame = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) {
      showToast('Camera is still starting — try again in a moment.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          stopPhotoCamera();
          if (blob) handleOcrImage(blob);
          else showToast("Couldn't capture the frame.");
        },
        'image/jpeg',
        0.94
      );
    }
  };

  const handleOcrImage = async (file: File | Blob) => {
    if (!file) return;
    setOcrLoading(true);
    setOcrProgress(0);
    try {
      if (!window.Tesseract) {
        throw new Error('OCR library not loaded');
      }
      const r = await window.Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (typeof m.progress === 'number') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });
      const text = (r.data.text || '').replace(/\r/g, '').trim();
      setOcrLoading(false);
      if (text.length < 8) {
        showToast("Couldn't read enough text — try a clearer photo or demo label");
        return;
      }
      applyPhotoResult(text, true);
    } catch {
      setOcrLoading(false);
      showToast("Couldn't read that image — try a sharper photo or demo label");
    }
  };

  const applyPhotoResult = (text: string, saveToHist = true) => {
    setCurrentPhotoText(text);
    const name = extractName(text);
    const sugar = extractNumber(text, /sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i);
    const protein = extractNumber(text, /protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i);
    const flags = parseIngredientFlags(text);
    const allergyHits = computeAllergyHits(text);

    setLastScanContext({
      name,
      text,
      flags,
      allergyHits,
      sugar,
      protein
    });

    if (saveToHist) {
      const newEntry: ScanHistoryItem = {
        id: `ocr-${Date.now()}`,
        type: 'photo',
        rawText: text,
        name,
        date: new Date().toLocaleString(),
        score: allergyHits.length ? 'Allergy match' : 'Label read',
        favorite: false
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 29)]);
    }
    showToast('Label decoded');
  };

  // Compare logic
  const fetchProductForCompare = async (rawCode: string): Promise<OpenFoodFactsProduct | null> => {
    const code = (rawCode || '').replace(/\D/g, '');
    if (!code) return null;
    if (sampleProducts[code]) return sampleProducts[code];
    try {
      const fields =
        'product_name,brands,ingredients_text,nutriscore_grade,nova_group,additives_tags,allergens_tags,nutrient_levels,nutriments';
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data.status !== 1 || !data.product) return null;
      return data.product;
    } catch {
      return null;
    }
  };

  const handleRunCompare = async (overrideA?: string, overrideB?: string) => {
    const codeA = (overrideA ?? compareCodeA).trim();
    const codeB = (overrideB ?? compareCodeB).trim();
    if (!codeA || !codeB) {
      showToast('Enter both barcodes to compare');
      return;
    }
    setCompareLoading(true);
    const [a, b] = await Promise.all([
      fetchProductForCompare(codeA),
      fetchProductForCompare(codeB)
    ]);
    setCompareProducts({ a, b });
    setCompareLoading(false);
  };

  // Guided AI Q&A
  const triggerGuidedQuestion = (key: string) => {
    const c = lastScanContext;
    const questionKey = `aiQ${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const questionLabel = t(questionKey);
    let answer = '';

    if (!c) {
      answer = t('noContext');
    } else if (key === 'ingredients') {
      const fs = c.flags || [];
      answer = fs.length
        ? `The current result flagged ${fs.map((x) => x.label).join(', ')}. These flags are prompts to understand the ingredient or label context, not proof that the food is harmful.`
        : 'No rule-based ingredient flags were triggered by the text available to KIACHE.';
    } else if (key === 'nutrition') {
      const nutriments = c.product?.nutriments;
      const s = c.sugar ?? nutriments?.sugars_100g ?? null;
      const p = c.protein ?? nutriments?.proteins_100g ?? null;
      answer = `KIACHE found ${s != null ? `about ${s} g sugars` : 'no clear sugar value'}${
        p != null ? ` and ${p} g protein` : ''
      }. Use the full nutrition panel and serving size for the complete picture.`;
    } else if (key === 'allergens') {
      answer = c.allergyHits?.length
        ? `Your selected allergy preferences matched: ${c.allergyHits.join(', ')}. Please verify the package's allergen statement before eating.`
        : 'No selected allergy preference matched the text KIACHE could read. This is not a guarantee of allergen absence.';
    } else if (key === 'processing') {
      const n = c.product?.nova_group;
      answer = n
        ? `NOVA ${n} is a category describing the degree and purpose of processing. It should be read alongside nutrition, ingredients and the type of food.`
        : 'NOVA information is not available in this result.';
    } else if (key === 'score') {
      const g = (c.product?.nutriscore_grade || '').toUpperCase();
      answer = g
        ? `Nutri-Score ${g} is a front-of-pack nutritional summary based on the Nutri-Score method. It is not a medical score and should not replace the full label.`
        : 'Nutri-Score is not available for this product.';
    } else if (key === 'data') {
      answer = c.product
        ? 'This result uses product data returned from Open Food Facts. Because formulations can change and the database is community-maintained, check the current package for critical details.'
        : 'This result uses OCR from the label image. OCR can misread small or glossy print, so verify critical information on the package.';
    }

    setChatMessages((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, role: 'guided-q', text: `${t('yes')} — ${questionLabel}` },
      { id: `a-${Date.now() + 1}`, role: 'guided-a', text: answer }
    ]);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q) return;
    const reply = answerFreeTextQuestion(q, chatExplainMode, lastScanContext);
    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: q },
      { id: `b-${Date.now() + 1}`, role: 'bot', text: reply }
    ]);
    setChatInput('');
  };

  // History actions
  const openHistoryEntry = (item: ScanHistoryItem) => {
    navigateTo('scan');
    if (item.type === 'barcode' && item.product) {
      setScanMode('barcode');
      setBarcodeInput(item.code || '');
      applyBarcodeProduct(item.product, item.code || '', false);
    } else if (item.rawText) {
      setScanMode('photo');
      applyPhotoResult(item.rawText, false);
    }
  };

  const toggleHistoryFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextFav = !item.favorite;
          showToast(nextFav ? 'Saved to favourites' : 'Removed from favourites');
          return { ...item, favorite: nextFav };
        }
        return item;
      })
    );
  };

  const deleteHistoryEntry = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast('Scan deleted');
  };

  // Computed stats for Home Snapshot
  const sweetTerms = sweetenerKeys.map((k) =>
    ingredientKnowledge[k].label.toLowerCase().split(' ')[0]
  );
  const withSweetenersCount = history.filter((x) => {
    const txt = (x.rawText || x.product?.ingredients_text || '').toLowerCase();
    return sweetTerms.some((term) => txt.includes(term));
  }).length;
  const allergyMatchCount = history.filter((x) => (x.score || '').includes('Allergy')).length;
  const favouritesCount = history.filter((x) => x.favorite).length;

  // Filtered dictionary entries
  const filteredDictEntries = Object.entries(ingredientKnowledge).filter(
    ([key, entry]) =>
      (dictCategory === 'All' || entry.category === dictCategory) &&
      ingredientMatchesQuery(key, entry, dictSearch)
  );

  // Nutri-Score color helper
  const nutriColor = (g: string) =>
    ({
      a: '#1E8F4E',
      b: '#7CB93E',
      c: '#C99A2E',
      d: '#B06A2C',
      e: '#8C2E27'
    }[g.toLowerCase()] || '#8E958F');

  const levelFillColor = (l?: string) =>
    l === 'high' ? '#8C2E27' : l === 'moderate' ? '#8C6A1F' : l === 'low' ? '#1E8F4E' : '#B9B3A8';
  const levelWidth = (l?: string) =>
    l === 'high' ? '90%' : l === 'moderate' ? '55%' : l === 'low' ? '25%' : '10%';

  if (showOnboarding) {
    return (
      <div className="min-h-screen grid place-items-center p-4 md:p-8 bg-[#FBF8F2]">
        <div className="w-full max-w-[780px] bg-white border border-[#26302A]/10 rounded-[34px] p-7 md:p-12 shadow-xl text-center">
          <div className="font-extrabold tracking-tight text-4xl text-[#26302A]">
            KIACHE<span className="text-[#6A4C93]">?</span>
          </div>
          <p className="uppercase tracking-[0.16em] font-bold text-[#26302A]/60 text-xs mt-7">
            {t('welcome')}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-[#26302A] my-4 mx-auto max-w-2xl">
            {t('entryTitle')}
          </h1>
          <p className="text-lg md:text-xl text-[#26302A]/70 max-w-xl mx-auto leading-relaxed">
            {t('entryDesc')}
          </p>

          <p className="uppercase tracking-[0.16em] font-bold text-[#26302A]/60 text-xs mt-7 mb-3">
            {t('chooseLanguage')}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 my-4">
            {(['en', 'hi', 'bn', 'mr'] as LanguageCode[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-4 py-2.5 rounded-full text-base font-medium border transition cursor-pointer ${
                  lang === l
                    ? 'bg-[#3F5D4B] text-white border-[#3F5D4B]'
                    : 'bg-white text-[#26302A] border-[#DED6C9] hover:border-[#3F5D4B]'
                }`}
              >
                {{ en: 'English', hi: 'हिन्दी', bn: 'বাংলা', mr: 'मराठी' }[l]}
              </button>
            ))}
          </div>

          <div className="my-5 p-5 bg-[#E8F0EA] rounded-2xl">
            <p className="uppercase tracking-[0.16em] font-bold text-[#26302A]/70 text-xs">
              {t('allergyOnboardingTitle')}
            </p>
            <p className="text-sm text-[#26302A]/80 mt-1.5 mb-3">
              {t('allergyOnboardingHelp')}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allergenOptions.map((allergen) => {
                const active = selectedAllergens.includes(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition cursor-pointer ${
                      active
                        ? 'bg-[#3F5D4B] text-white border-[#3F5D4B]'
                        : 'bg-white text-[#26302A] border-[#DED6C9]'
                    }`}
                  >
                    {allergen}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('kiacheEntered', '1');
                setShowOnboarding(false);
              }}
              className="px-7 py-4 rounded-2xl bg-[#3F5D4B] text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
            >
              {t('getStarted')}
            </button>
          </div>

          <MascotTrack />
          <p className="text-xs text-[#26302A]/60 mt-4">
            Food information should inform, not frighten.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-[265px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col sticky top-0 h-screen bg-gradient-to-b from-[#E8F0EA] to-[#F1EBF7] text-[#26302A] p-6 border-r border-[#26302A]/10">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="text-left font-extrabold tracking-tight text-4xl px-2 pb-7 cursor-pointer"
        >
          KIACHE<span className="text-[#6A4C93]">?</span>
        </button>

        <nav className="grid gap-1.5">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${
              activePage === 'home' ? 'bg-[#B89568] text-[#26302A]' : 'hover:bg-[#26302A]/5'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>{t('home')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('scan')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${
              activePage === 'scan' ? 'bg-[#B89568] text-[#26302A]' : 'hover:bg-[#26302A]/5'
            }`}
          >
            <ScanLine className="w-5 h-5 shrink-0" />
            <span>{t('scanNav')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('dictionary')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${
              activePage === 'dictionary' ? 'bg-[#B89568] text-[#26302A]' : 'hover:bg-[#26302A]/5'
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>{t('dictionaryNav')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('compare')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${
              activePage === 'compare' ? 'bg-[#B89568] text-[#26302A]' : 'hover:bg-[#26302A]/5'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 shrink-0" />
            <span>{t('compareNav')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('history')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${
              activePage === 'history' ? 'bg-[#B89568] text-[#26302A]' : 'hover:bg-[#26302A]/5'
            }`}
          >
            <History className="w-5 h-5 shrink-0" />
            <span>{t('history')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('settings')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-base transition cursor-pointer ${
              activePage === 'settings' ? 'bg-[#B89568] text-[#26302A]' : 'hover:bg-[#26302A]/5'
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span>{t('settings')}</span>
          </button>
        </nav>

        <div className="mt-auto bg-white border border-[#26302A]/10 p-4 rounded-2xl text-sm text-center shadow-sm">
          <strong className="block text-xs tracking-widest uppercase text-[#26302A] mb-1.5">
            KIACHE Note
          </strong>
          You don&apos;t need perfect choices. Just a little more information.
        </div>

        <div className="border-t border-[#26302A]/10 mt-4 pt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#E6D4BA] text-[#26302A] font-extrabold grid place-items-center text-base">
              {(userName || 'G').slice(0, 1).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-[#26302A] leading-tight">
                {userName || 'Guest'}
              </div>
              <div className="text-xs text-[#26302A]/60">Curious eater</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            title="Language & Allergy Setup"
            className="text-xs font-bold text-[#6A4C93] hover:underline cursor-pointer"
          >
            Setup
          </button>
        </div>
        <div className="text-[11px] text-[#26302A]/60 mt-2.5 text-left">
          Developed by Tanushree Roy
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-5 md:p-8 max-w-[1220px] w-full mx-auto pb-28 md:pb-12">
        {/* Top Bar: Brand | Navigation links | Settings */}
        <header className="flex items-center justify-between gap-4 mb-7 pb-3 border-b border-[#DED6C9]/80">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="font-extrabold tracking-tight text-3xl md:text-4xl text-[#26302A] cursor-pointer shrink-0"
          >
            KIACHE<span className="text-[#6A4C93]">?</span>
          </button>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#26302A]/75">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`hover:text-[#26302A] transition whitespace-nowrap cursor-pointer ${
                activePage === 'home' ? 'text-[#26302A] underline underline-offset-8 decoration-2 decoration-[#3F5D4B]' : ''
              }`}
            >
              {t('home')}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('scan')}
              className={`hover:text-[#26302A] transition whitespace-nowrap cursor-pointer ${
                activePage === 'scan' ? 'text-[#26302A] underline underline-offset-8 decoration-2 decoration-[#3F5D4B]' : ''
              }`}
            >
              {t('scanNav')}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('dictionary')}
              className={`hover:text-[#26302A] transition whitespace-nowrap cursor-pointer ${
                activePage === 'dictionary' ? 'text-[#26302A] underline underline-offset-8 decoration-2 decoration-[#3F5D4B]' : ''
              }`}
            >
              {t('dictionaryNav')}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('compare')}
              className={`hover:text-[#26302A] transition whitespace-nowrap cursor-pointer ${
                activePage === 'compare' ? 'text-[#26302A] underline underline-offset-8 decoration-2 decoration-[#3F5D4B]' : ''
              }`}
            >
              {t('compareNav')}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('history')}
              className={`hover:text-[#26302A] transition whitespace-nowrap cursor-pointer ${
                activePage === 'history' ? 'text-[#26302A] underline underline-offset-8 decoration-2 decoration-[#3F5D4B]' : ''
              }`}
            >
              {t('history')}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('settings')}
              className={`hover:text-[#26302A] transition whitespace-nowrap cursor-pointer ${
                activePage === 'settings' ? 'text-[#26302A] underline underline-offset-8 decoration-2 decoration-[#3F5D4B]' : ''
              }`}
            >
              {t('settings')}
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigateTo('scan')}
              className="px-4 py-2.5 rounded-2xl text-sm font-bold bg-[#3F5D4B] text-white shadow-sm hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>{t('scanNav')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('settings')}
              title="Settings & Language"
              className={`w-11 h-11 rounded-full border border-[#DED6C9] bg-white grid place-items-center transition cursor-pointer ${
                activePage === 'settings' ? 'bg-[#B89568] border-[#B89568] text-[#26302A]' : 'text-[#3F5D4B]'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* PAGE: HOME */}
        {activePage === 'home' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                  {t('welcome')}
                  {userName ? `, ${userName}` : ''}
                </p>
                <h2 className="font-serif text-3xl md:text-5xl text-[#26302A] mt-1">
                  {t('homeGreetingTitle')}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3F5D4B]" />
                <select
                  value={lang}
                  onChange={(e) => {
                    setLang(e.target.value as LanguageCode);
                    showToast('Language updated');
                  }}
                  aria-label="Select language"
                  className="border border-[#DED6C9] bg-white rounded-xl px-3.5 py-2 text-sm font-bold text-[#26302A] cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="bn">বাংলা</option>
                  <option value="mr">मराठी</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Hero Card */}
              <article className="lg:col-span-7 bg-[#E8F0EA] border border-[#26302A]/10 rounded-[28px] p-7 md:p-10 flex flex-col justify-center text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/65">
                  {t('heroEyebrow')}
                </p>
                <h1 className="font-serif text-4xl md:text-6xl text-[#26302A] my-3">
                  {t('heroTitle')}
                </h1>
                <p className="text-[#26302A]/85 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                  {t('heroDesc')}
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => navigateTo('scan')}
                    className="px-6 py-3.5 rounded-2xl bg-[#3F5D4B] text-white font-bold text-base shadow-md hover:-translate-y-0.5 transition cursor-pointer whitespace-nowrap"
                  >
                    {t('scanLabel')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('dictionary')}
                    className="px-5 py-3.5 rounded-2xl bg-white text-[#26302A] border border-[#DED6C9] font-bold text-base hover:-translate-y-0.5 transition cursor-pointer whitespace-nowrap"
                  >
                    {t('dictionaryNav')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('compare')}
                    className="px-5 py-3.5 rounded-2xl bg-[#F1EBF7] text-[#26302A] font-bold text-base hover:-translate-y-0.5 transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    {t('compareNav')}
                  </button>
                </div>
              </article>

              {/* Did You Know Card */}
              <article className="lg:col-span-5 bg-[#F1E6D7] border border-[#26302A]/10 rounded-[28px] p-7 md:p-8 flex flex-col justify-between text-center shadow-sm">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#26302A]/70">
                    {t('didYouKnow')} · Fact {(factIndex % facts.length) + 1} of {facts.length}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-3 mb-3">
                    {facts[factIndex % facts.length][0]}
                  </h3>
                  <p className="text-[#26302A]/85 text-base md:text-lg leading-relaxed">
                    {facts[factIndex % facts.length][1]}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#26302A]/10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setFactIndex((prev) => (prev + 1) % facts.length)}
                    className="text-xs font-bold text-[#26302A] hover:text-[#6A4C93] flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Next food science fact
                  </button>
                </div>
              </article>

              {/* Recent Scans Card */}
              <article className="lg:col-span-7 bg-white border border-[#26302A]/10 rounded-[28px] p-7 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                  {t('recentScans')}
                </p>
                <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-1.5 mb-4">
                  {t('savedLater')}
                </h3>
                {history.length > 0 ? (
                  <div className="divide-y divide-[#DED6C9]">
                    {history.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openHistoryEntry(item)}
                        className="w-full py-3 px-2 hover:bg-[#FBF8F2] rounded-xl transition flex items-center justify-between gap-3 text-left cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-base text-[#26302A]">
                            {item.name} {item.favorite ? '★' : ''}
                          </div>
                          <div className="text-xs text-[#26302A]/60">
                            {item.date} · {item.score}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#26302A]/40 shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-[#CFC9BB] rounded-2xl text-[#26302A]/60 text-sm">
                    Your scans will appear here. Scan a food label to start building your history.
                  </div>
                )}
              </article>

              {/* Snapshot Card */}
              <article className="lg:col-span-5 bg-[#F1EBF7] border border-[#26302A]/10 rounded-[28px] p-7 text-center shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                    {t('quickInsight')}
                  </p>
                  <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-1.5 mb-4">
                    {t('kiacheSnapshot')}
                  </h3>
                  <div className="divide-y divide-[#DED6C9]/80 text-sm">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#26302A]/80">Products scanned</span>
                      <b className="font-mono text-base text-[#6A4C93]">{history.length}</b>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#26302A]/80">Contained alternative sweeteners</span>
                      <b className="font-mono text-base text-[#6A4C93]">{withSweetenersCount}</b>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#26302A]/80">Matched an allergy preference</span>
                      <b className="font-mono text-base text-[#6A4C93]">{allergyMatchCount}</b>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#26302A]/80">Saved to favourites</span>
                      <b className="font-mono text-base text-[#6A4C93]">{favouritesCount}</b>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DED6C9]/70 text-xs text-[#26302A]/70">
                  Watching for allergens:{' '}
                  <strong>
                    {selectedAllergens.length ? selectedAllergens.join(', ') : 'None selected'}
                  </strong>
                </div>
              </article>
            </div>
          </section>
        )}

        {/* PAGE: SCANNER */}
        {activePage === 'scan' && (
          <section className="space-y-6 max-w-4xl mx-auto">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                {t('scannerEyebrow')}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-[#26302A] mt-1">
                {t('decodeTitle')}
              </h2>
            </div>

            {/* Segmented Mode Toggle */}
            <div className="inline-flex gap-1.5 bg-[#F1EBF7] p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setScanMode('barcode');
                  stopPhotoCamera();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer whitespace-nowrap ${
                  scanMode === 'barcode'
                    ? 'bg-white text-[#26302A] shadow-sm'
                    : 'text-[#26302A]/75 hover:text-[#26302A]'
                }`}
              >
                {t('modeBarcode')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScanMode('photo');
                  stopBarcodeCamera();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer whitespace-nowrap ${
                  scanMode === 'photo'
                    ? 'bg-white text-[#26302A] shadow-sm'
                    : 'text-[#26302A]/75 hover:text-[#26302A]'
                }`}
              >
                {t('modePhoto')}
              </button>
            </div>

            {scanMode === 'barcode' ? (
              <div className="space-y-6">
                <div className="bg-[#E8F0EA] border border-[#26302A]/10 rounded-[28px] p-6 md:p-8 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/65">
                    Product Lookup
                  </p>
                  <p className="text-sm text-[#26302A]/85 mt-1.5 mb-4">
                    {t('barcodeIntro')}
                  </p>

                  <div className="flex flex-wrap gap-2.5 justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder={t('barcodePlaceholder')}
                      className="flex-1 min-w-[200px] border border-[#DED6C9] bg-white rounded-xl px-4 py-3 text-base font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleLookupBarcode(barcodeInput, true)}
                      className="px-5 py-3 rounded-xl bg-[#3F5D4B] text-white font-bold text-sm cursor-pointer whitespace-nowrap"
                    >
                      {t('lookUp')}
                    </button>
                    <button
                      type="button"
                      onClick={barcodeCameraActive ? stopBarcodeCamera : startBarcodeCamera}
                      className="px-5 py-3 rounded-xl bg-[#F1EBF7] text-[#26302A] font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      {barcodeCameraActive ? t('cancelCamera') : t('scanWithCamera')}
                    </button>
                  </div>

                  {/* Quick Try Barcodes */}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="text-[#26302A]/65 font-semibold">Quick test barcodes:</span>
                    {Object.values(sampleProducts).map((sp) => (
                      <button
                        key={sp.code}
                        type="button"
                        onClick={() => handleLookupBarcode(sp.code || '', true)}
                        className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white border border-[#DED6C9] text-[#26302A] font-medium transition cursor-pointer"
                      >
                        {sp.product_name?.split(' ').slice(0, 2).join(' ')} ({sp.code})
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2.5 justify-center mt-4 pt-4 border-t border-[#26302A]/10">
                    <input
                      type="text"
                      value={productSearchInput}
                      onChange={(e) => setProductSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchProduct(productSearchInput);
                      }}
                      placeholder={t('productSearchPlaceholder')}
                      className="flex-1 min-w-[200px] border border-[#DED6C9] bg-white rounded-xl px-4 py-3 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => handleSearchProduct(productSearchInput)}
                      className="px-5 py-3 rounded-xl bg-white border border-[#DED6C9] text-[#26302A] font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      {t('searchProduct')}
                    </button>
                  </div>

                  {barcodeCameraActive && (
                    <video
                      ref={barcodeVideoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-2xl mt-4 max-h-72 object-cover bg-[#18251F]"
                    />
                  )}

                  {barcodeStatus && (
                    <p className="text-sm font-medium text-[#26302A] mt-3">{barcodeStatus}</p>
                  )}

                  <p className="text-xs text-[#26302A]/60 mt-3">{t('sourceNote')}</p>
                </div>

                {/* Search Results Chooser */}
                {searchResults && (
                  <div className="bg-white border border-[#DED6C9] rounded-[28px] p-6 text-center space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                      Matches
                    </p>
                    <h3 className="font-serif text-2xl text-[#26302A]">Choose a product</h3>
                    <div className="divide-y divide-[#DED6C9]">
                      {searchResults.map((p, idx) => (
                        <button
                          key={p.code || idx}
                          type="button"
                          onClick={() => {
                            setSearchResults(null);
                            applyBarcodeProduct(p, p.code || '', true);
                          }}
                          className="w-full py-3 px-3 hover:bg-[#FBF8F2] transition flex items-center justify-between text-left cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-base text-[#26302A]">
                              {p.product_name || 'Unnamed product'}
                            </div>
                            <div className="text-xs text-[#26302A]/60">
                              {p.brands || 'Unknown brand'} {p.code ? `· ${p.code}` : ''}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#26302A]/40" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Barcode Result Display */}
                {currentBarcodeResult && (() => {
                  const p = currentBarcodeResult.product;
                  const grade = (p.nutriscore_grade || '').toLowerCase();
                  const nova = Number(p.nova_group) || null;
                  const levels = p.nutrient_levels || {};
                  const additives = (p.additives_tags || []).map((x) =>
                    x.replace(/^en:/, '').replace(/-/g, ' ').toUpperCase()
                  );
                  const allergens = (p.allergens_tags || []).map((x) => x.replace(/^en:/, ''));
                  const traces = (p.traces_tags || []).map((x) => x.replace(/^en:/, ''));
                  const ingredients =
                    p.ingredients_text || "Ingredient text wasn't provided by this source.";
                  const ingredientFlags = parseIngredientFlags(ingredients);
                  const allergyHits = computeAllergyHits(
                    `${ingredients} ${allergens.join(' ')}`
                  );
                  const claimText = [p.product_name, p.labels, p.categories]
                    .filter(Boolean)
                    .join(' ');
                  const swap = detectSweetenerSwap(claimText, ingredients);

                  const statusSummary: string[] = [];
                  if (nova === 4) statusSummary.push('NOVA 4: ultra-processed');
                  else if (nova === 3) statusSummary.push('NOVA 3: processed');
                  if (levels.sugars === 'high') statusSummary.push('High sugar level');
                  if (levels['saturated-fat'] === 'high')
                    statusSummary.push('High saturated-fat level');
                  if (levels.salt === 'high') statusSummary.push('High salt level');
                  if (additives.length >= 3)
                    statusSummary.push(`${additives.length} additives listed`);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Overview */}
                      <article className="bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Product
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-2">
                          {p.product_name || 'Unnamed product'}
                        </h3>
                        {p.brands && (
                          <p className="text-xs text-[#26302A]/60 mt-1">
                            {p.brands} {p.quantity ? `· ${p.quantity}` : ''}{' '}
                            {currentBarcodeResult.code ? `· ${currentBarcodeResult.code}` : ''}
                          </p>
                        )}

                        <div className="flex flex-wrap justify-center items-center gap-6 my-4">
                          {grade ? (
                            <div className="text-center">
                              <div
                                className="w-14 h-14 rounded-full grid place-items-center text-white font-serif text-2xl mx-auto shadow"
                                style={{ background: nutriColor(grade) }}
                              >
                                {grade.toUpperCase()}
                              </div>
                              <div className="text-[11px] font-bold uppercase tracking-wider text-[#26302A]/60 mt-1">
                                Nutri-Score
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#26302A]/70">
                              Nutri-Score: not available
                            </span>
                          )}

                          {nova ? (
                            <div className="text-center">
                              <div
                                className="w-14 h-14 rounded-full grid place-items-center text-white font-serif text-2xl mx-auto shadow"
                                style={{
                                  background:
                                    nova >= 4 ? '#8C2E27' : nova === 3 ? '#8C6A1F' : '#1E8F4E'
                                }}
                              >
                                {nova}
                              </div>
                              <div className="text-[11px] font-bold uppercase tracking-wider text-[#26302A]/60 mt-1">
                                NOVA
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#26302A]/70">NOVA: not available</span>
                          )}
                        </div>

                        {statusSummary.length > 0 && (
                          <p className="text-xs font-semibold text-[#8C6A1F] my-2">
                            {statusSummary.join(' · ')}
                          </p>
                        )}

                        {allergyHits.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-xl bg-[#F1E1DD] text-[#8C2E27] text-xs font-bold flex items-center justify-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            Check allergy preference: {allergyHits.join(', ')}
                          </div>
                        )}

                        <p className="text-xs text-[#26302A]/60 mt-3 leading-relaxed">
                          <b>Nutri-Score</b> summarizes nutritional quality (A–E); <b>NOVA</b>{' '}
                          describes the degree of processing (1–4). Neither is a medical diagnosis.
                        </p>
                      </article>

                      {/* Nutrient Levels */}
                      <article className="bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Nutrient Levels
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-2 mb-4">
                          What matters
                        </h3>
                        <div className="space-y-3">
                          {(
                            [
                              ['Sugar', 'sugars'],
                              ['Fat', 'fat'],
                              ['Saturated fat', 'saturated-fat'],
                              ['Salt', 'salt']
                            ] as const
                          ).map(([label, key]) => {
                            const lvl = levels[key];
                            if (!lvl) return null;
                            return (
                              <div key={key} className="flex items-center gap-3 text-sm">
                                <span className="w-28 text-left font-bold text-[#26302A]">
                                  {label}
                                </span>
                                <div className="flex-1 h-2.5 rounded-full bg-[#EDEAE0] overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: levelWidth(lvl),
                                      background: levelFillColor(lvl)
                                    }}
                                  />
                                </div>
                                <span
                                  className="w-20 text-right font-extrabold text-xs uppercase"
                                  style={{ color: levelFillColor(lvl) }}
                                >
                                  {lvl}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {p.nutriments && (
                          <div className="mt-5 pt-4 border-t border-[#DED6C9]/70 grid grid-cols-3 gap-2 text-xs font-mono">
                            <div>
                              <span className="text-[#26302A]/60 block font-sans">Energy</span>
                              <b>{p.nutriments['energy-kcal_100g'] ?? '—'} kcal</b>
                            </div>
                            <div>
                              <span className="text-[#26302A]/60 block font-sans">Protein</span>
                              <b>{p.nutriments.proteins_100g ?? '—'} g</b>
                            </div>
                            <div>
                              <span className="text-[#26302A]/60 block font-sans">Sugars</span>
                              <b>{p.nutriments.sugars_100g ?? '—'} g</b>
                            </div>
                          </div>
                        )}
                      </article>

                      {/* Ingredients */}
                      <article className="bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Ingredients
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-2 mb-3">
                          What&apos;s inside
                        </h3>
                        <p className="text-sm text-[#26302A]/80 leading-relaxed">{ingredients}</p>
                        {additives.length > 0 && (
                          <p className="text-xs text-[#26302A]/65 mt-3">
                            <b>Additives listed ({additives.length}):</b> {additives.join(', ')}
                          </p>
                        )}
                      </article>

                      {/* Ingredient Flags */}
                      <article className="bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Ingredient Flags
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-2 mb-3">
                          Worth understanding
                        </h3>
                        {ingredientFlags.length > 0 ? (
                          <div className="space-y-2.5 text-left">
                            {ingredientFlags.map((f) => (
                              <div
                                key={f.label}
                                className="p-3 rounded-2xl bg-[#F1EBF7] border border-[#D8C7E5]"
                              >
                                <strong className="text-sm text-[#6A4C93] block">{f.label}</strong>
                                <span className="text-xs text-[#26302A]/80 leading-relaxed">
                                  {f.why}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[#26302A]/70">
                            No rule-based ingredient flags were triggered.
                          </p>
                        )}
                      </article>

                      {/* Sweetener Swap Alert */}
                      {swap && (
                        <article className="md:col-span-2 bg-[#F1EBF7] border border-[#D8C7E5] rounded-[28px] p-6 text-center">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#6A4C93]">
                            What&apos;s really going on?
                          </p>
                          <h3 className="font-serif text-2xl text-[#26302A] mt-1 mb-2">
                            The label suggests low/zero sugar
                          </h3>
                          <p className="text-sm text-[#26302A]/85">
                            <b>KIACHE found:</b>{' '}
                            {swap.sweeteners.length
                              ? swap.sweeteners.map((s) => s.label).join(' + ')
                              : 'No specific alternative sweetener could be confirmed from available data.'}
                          </p>
                          <p className="text-xs text-[#26302A]/75 mt-2 max-w-2xl mx-auto">
                            Sweetness likely comes from the sweetener(s) above rather than
                            conventional sugar. This is a different ingredient doing the same job —
                            not automatically better or worse.
                          </p>
                        </article>
                      )}

                      {/* Allergen Statement */}
                      <article className="md:col-span-2 bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Allergen Statement
                        </p>
                        <h3 className="font-serif text-2xl text-[#26302A] mt-1 mb-2">
                          Contains vs. may contain
                        </h3>
                        <p className="text-sm text-[#26302A]/80">
                          <b>Contains (source-listed):</b>{' '}
                          {allergens.length
                            ? allergens.join(', ')
                            : 'No allergens declared by this source.'}
                        </p>
                        <p className="text-sm text-[#26302A]/80 mt-1">
                          <b>May contain / traces:</b>{' '}
                          {traces.length
                            ? traces.join(', ')
                            : 'No traces statement provided by this source.'}
                        </p>
                        <div className="mt-4 p-3.5 rounded-2xl bg-[#F1E6D7] text-[#5A4938] text-xs leading-relaxed">
                          <b>Source &amp; accuracy:</b> Product data shown here comes from Open Food
                          Facts when available. Always verify the physical package for allergens and
                          current formulation.
                        </div>
                      </article>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* PHOTO OCR MODE */
              <div className="space-y-6">
                <div className="bg-[#E8F0EA] border border-[#26302A]/10 rounded-[28px] p-5 text-center">
                  <div className="relative h-[360px] md:h-[410px] bg-[#18251F] rounded-[24px] overflow-hidden grid place-items-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute inset-0 w-full h-full object-cover ${
                        cameraActive ? '' : 'hidden'
                      }`}
                    />
                    {/* Scan Frame Corners */}
                    <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-[#E6D4BA] pointer-events-none" />
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-[#E6D4BA] pointer-events-none" />
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-[#E6D4BA] pointer-events-none" />
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-[#E6D4BA] pointer-events-none" />

                    {/* Scan beam */}
                    <div className="absolute left-[12%] right-[12%] top-[24%] h-0.5 bg-[#E6D4BA] shadow-[0_0_16px_#E6D4BA] animate-scan-beam pointer-events-none" />

                    <div className="relative z-10 text-white font-bold text-xl md:text-2xl px-6 drop-shadow">
                      {ocrLoading ? `Reading label… ${ocrProgress}%` : scanFeedbackText}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 py-2 px-4 rounded-xl bg-[#18251F]/80 text-white text-xs backdrop-blur-sm">
                      Center the ingredients panel inside the frame, or choose a demo label below.
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {!cameraActive ? (
                      <button
                        type="button"
                        onClick={startPhotoCamera}
                        className="px-5 py-3 rounded-xl bg-[#3F5D4B] text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        {t('useCamera')}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={capturePhotoFrame}
                          className="px-5 py-3 rounded-xl bg-[#3F5D4B] text-white font-bold text-sm cursor-pointer"
                        >
                          {t('capturePhoto')}
                        </button>
                        <button
                          type="button"
                          onClick={stopPhotoCamera}
                          className="px-5 py-3 rounded-xl bg-white border border-[#DED6C9] text-[#26302A] font-bold text-sm cursor-pointer"
                        >
                          {t('cancelCamera')}
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-3 rounded-xl bg-[#F1EBF7] text-[#26302A] font-bold text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {t('choosePhoto')}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleOcrImage(e.target.files[0]);
                      }}
                    />
                  </div>

                  {/* Demo Label Selector */}
                  <div className="mt-4 pt-3 border-t border-[#26302A]/10 flex flex-wrap justify-center items-center gap-2 text-xs">
                    <span className="font-semibold text-[#26302A]/70 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#6A4C93]" />
                      Try a sample label:
                    </span>
                    {demoLabels.map((dl) => (
                      <button
                        key={dl.id}
                        type="button"
                        onClick={() => applyPhotoResult(dl.text, true)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#DED6C9] text-[#26302A] font-semibold hover:border-[#3F5D4B] transition cursor-pointer"
                      >
                        {dl.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* OCR Result */}
                {currentPhotoText && (() => {
                  const name = extractName(currentPhotoText);
                  const sugar = extractNumber(
                    currentPhotoText,
                    /sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i
                  );
                  const protein = extractNumber(
                    currentPhotoText,
                    /protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i
                  );
                  const flags = parseIngredientFlags(currentPhotoText);
                  const ingredientText =
                    currentPhotoText
                      .split(/ingredients\s*:/i)[1]
                      ?.split(/nutrition/i)[0]
                      ?.trim() || currentPhotoText;
                  const allergyHits = computeAllergyHits(currentPhotoText);
                  const swap = detectSweetenerSwap(currentPhotoText, ingredientText);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <article className="bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Quick Read
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-2">
                          {name}
                        </h3>
                        {allergyHits.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-xl bg-[#F1E1DD] text-[#8C2E27] text-xs font-bold">
                            Preference match: {allergyHits.join(', ')}
                          </div>
                        )}
                        <p className="text-sm text-[#26302A]/75 mt-3 leading-relaxed">
                          KIACHE highlights items to understand; it does not diagnose, prescribe or
                          label a food simply good or bad.
                        </p>
                      </article>

                      <article className="bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Ingredients
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-2 mb-2">
                          What&apos;s inside
                        </h3>
                        <p className="text-sm text-[#26302A]/80 leading-relaxed">
                          {ingredientText}
                        </p>
                      </article>

                      <article className="bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Ingredient Flags
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-2 mb-3">
                          Worth understanding
                        </h3>
                        {flags.length > 0 ? (
                          <div className="space-y-2.5 text-left">
                            {flags.map((f) => (
                              <div
                                key={f.label}
                                className="p-3 rounded-2xl bg-[#F1EBF7] border border-[#D8C7E5]"
                              >
                                <strong className="text-sm text-[#6A4C93] block">{f.label}</strong>
                                <span className="text-xs text-[#26302A]/80">{f.why}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[#26302A]/70">
                            No rule-based ingredient flags were triggered by the text read.
                          </p>
                        )}
                      </article>

                      <article className="bg-white border border-[#26302A]/10 rounded-[28px] p-6 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                          Nutrition
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#26302A] mt-2 mb-2">
                          What matters
                        </h3>
                        <div className="text-sm text-[#26302A]/85 space-y-1 font-mono">
                          {protein !== null && <div>Protein: {protein} g</div>}
                          {sugar !== null && <div>Sugars: {sugar} g</div>}
                        </div>
                        <p className="text-sm text-[#26302A]/70 mt-3 leading-relaxed">
                          Read serving size, sugars, fibre, sodium and fats together rather than
                          judging one number alone.
                        </p>
                      </article>

                      {swap && (
                        <article className="md:col-span-2 bg-[#F1EBF7] border border-[#D8C7E5] rounded-[28px] p-6 text-center">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#6A4C93]">
                            What&apos;s really going on?
                          </p>
                          <h3 className="font-serif text-2xl text-[#26302A] mt-1 mb-2">
                            The label suggests low/zero sugar
                          </h3>
                          <p className="text-sm text-[#26302A]/85">
                            <b>KIACHE found:</b>{' '}
                            {swap.sweeteners.length
                              ? swap.sweeteners.map((s) => s.label).join(' + ')
                              : 'No specific alternative sweetener could be confirmed from the text read.'}
                          </p>
                          <p className="text-xs text-[#26302A]/75 mt-2 max-w-2xl mx-auto">
                            The product likely contains very little conventional sugar, with
                            sweetness instead coming from the sweetener(s) above.
                          </p>
                        </article>
                      )}

                      <article className="md:col-span-2">
                        <div className="p-4 rounded-2xl bg-[#F1E6D7] border border-[#E2D1B9] text-[#5A4938] text-xs leading-relaxed text-center">
                          <b>{t('reliable')}:</b> OCR is a text-reading aid and can misread glossy,
                          tiny or stylized print. If an allergy or safety decision matters, verify
                          the physical package.
                        </div>
                      </article>
                    </div>
                  );
                })()}
              </div>
            )}
          </section>
        )}

        {/* PAGE: INGREDIENT DICTIONARY */}
        {activePage === 'dictionary' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                  {t('dictionaryEyebrow')}
                </p>
                <h2 className="font-serif text-3xl md:text-5xl text-[#26302A] mt-1">
                  {t('dictionaryTitle')}
                </h2>
              </div>

              <div className="inline-flex gap-1 bg-[#F1EBF7] p-1 rounded-xl self-start">
                <button
                  type="button"
                  onClick={() => setDictSciMode(false)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    !dictSciMode ? 'bg-white text-[#26302A] shadow-sm' : 'text-[#26302A]/70'
                  }`}
                >
                  Plain explanation
                </button>
                <button
                  type="button"
                  onClick={() => setDictSciMode(true)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    dictSciMode ? 'bg-white text-[#26302A] shadow-sm' : 'text-[#26302A]/70'
                  }`}
                >
                  Food science mode
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#DED6C9] rounded-[28px] p-6 space-y-4">
              <p className="text-sm text-[#26302A]/75">{t('dictionaryDesc')}</p>
              <div className="relative">
                <Search className="w-4 h-4 text-[#26302A]/45 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={dictSearch}
                  onChange={(e) => setDictSearch(e.target.value)}
                  placeholder="Search an ingredient, E-number or INS number (e.g. E322, 621, sucralose)…"
                  className="w-full border border-[#DED6C9] rounded-xl pl-11 pr-4 py-3 text-base"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {dictionaryCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDictCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer whitespace-nowrap ${
                      dictCategory === cat
                        ? 'bg-[#3F5D4B] text-white border-[#3F5D4B]'
                        : 'bg-white text-[#26302A] border-[#DED6C9] hover:border-[#3F5D4B]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredDictEntries.length === 0 ? (
              <div className="p-8 bg-white border border-dashed border-[#CFC9BB] rounded-2xl text-center text-[#26302A]/65">
                No ingredient matched that search. Try just the number (e.g. &ldquo;621&rdquo; or
                &ldquo;322&rdquo;) or a plain ingredient name.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDictEntries.map(([key, entry]) => (
                  <article
                    key={key}
                    className="bg-white border border-[#DED6C9] rounded-2xl p-6 text-left shadow-sm space-y-2"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#26302A]/55">
                      {entry.category}
                      {entry.eNumber ? ` · ${entry.eNumber}` : ''}
                      {entry.insNumber ? ` · INS ${entry.insNumber}` : ''}
                    </div>
                    <h4 className="font-serif text-2xl text-[#26302A]">{entry.label}</h4>

                    <div className="pt-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6A4C93] block">
                        {dictSciMode ? 'Scientific mechanism' : 'Plain explanation'}
                      </span>
                      <p className="text-sm text-[#26302A]/85 leading-relaxed mt-0.5">
                        {dictSciMode
                          ? entry.scientist || entry.why
                          : entry.eli5 || entry.why}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6A4C93] block">
                        Why it&apos;s used
                      </span>
                      <p className="text-sm text-[#26302A]/80 leading-relaxed mt-0.5">
                        {entry.why}
                      </p>
                    </div>

                    {entry.watch && (
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3F5D4B] block">
                          Worth knowing
                        </span>
                        <p className="text-xs text-[#26302A]/75 leading-relaxed mt-0.5">
                          {entry.watch}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* PAGE: COMPARE PRODUCTS */}
        {activePage === 'compare' && (
          <section className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                {t('compareEyebrow')}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-[#26302A] mt-1">
                {t('compareTitle')}
              </h2>
              <p className="text-sm text-[#26302A]/75 mt-2">{t('compareDesc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#DED6C9] rounded-2xl p-5 text-left">
                <label className="block text-sm font-bold text-[#26302A] mb-1.5">
                  Product A Barcode
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={compareCodeA}
                  onChange={(e) => setCompareCodeA(e.target.value)}
                  placeholder="Barcode for product A"
                  className="w-full border border-[#DED6C9] rounded-xl px-4 py-2.5 font-mono text-sm"
                />
                {compareProducts.a && (
                  <p className="text-xs text-[#3F5D4B] font-semibold mt-2">
                    Loaded: {compareProducts.a.product_name} ({compareProducts.a.brands})
                  </p>
                )}
              </div>

              <div className="bg-white border border-[#DED6C9] rounded-2xl p-5 text-left">
                <label className="block text-sm font-bold text-[#26302A] mb-1.5">
                  Product B Barcode
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={compareCodeB}
                  onChange={(e) => setCompareCodeB(e.target.value)}
                  placeholder="Barcode for product B"
                  className="w-full border border-[#DED6C9] rounded-xl px-4 py-2.5 font-mono text-sm"
                />
                {compareProducts.b && (
                  <p className="text-xs text-[#6A4C93] font-semibold mt-2">
                    Loaded: {compareProducts.b.product_name} ({compareProducts.b.brands})
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleRunCompare()}
                className="px-6 py-3 rounded-2xl bg-[#3F5D4B] text-white font-bold text-sm cursor-pointer whitespace-nowrap"
              >
                {compareLoading ? 'Comparing…' : 'Compare →'}
              </button>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-[#26302A]/60 mr-1">Your priorities:</span>
                {comparePriorities.map((pr) => {
                  const active = compareSelectedPriorities.includes(pr);
                  return (
                    <button
                      key={pr}
                      type="button"
                      onClick={() =>
                        setCompareSelectedPriorities((prev) =>
                          prev.includes(pr) ? prev.filter((x) => x !== pr) : [...prev, pr]
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#3F5D4B] text-white border-[#3F5D4B]'
                          : 'bg-white text-[#26302A] border-[#DED6C9]'
                      }`}
                    >
                      {pr}
                    </button>
                  );
                })}
              </div>
            </div>

            {compareProducts.a && compareProducts.b ? (
              (() => {
                const a = compareProducts.a;
                const b = compareProducts.b;
                const na = a.nutriments || {};
                const nb = b.nutriments || {};
                const rows = [
                  {
                    label: 'Calories (per 100g)',
                    a: na['energy-kcal_100g'],
                    b: nb['energy-kcal_100g'],
                    lowerBetter: true
                  },
                  {
                    label: 'Protein (per 100g, g)',
                    a: na.proteins_100g,
                    b: nb.proteins_100g,
                    lowerBetter: false
                  },
                  {
                    label: 'Sugars (per 100g, g)',
                    a: na.sugars_100g,
                    b: nb.sugars_100g,
                    lowerBetter: true
                  },
                  {
                    label: 'Fibre (per 100g, g)',
                    a: na.fiber_100g,
                    b: nb.fiber_100g,
                    lowerBetter: false
                  },
                  {
                    label: 'Sodium (per 100g, mg)',
                    a: na.sodium_100g != null ? Math.round(na.sodium_100g * 1000) : undefined,
                    b: nb.sodium_100g != null ? Math.round(nb.sodium_100g * 1000) : undefined,
                    lowerBetter: true
                  },
                  {
                    label: 'Additives listed',
                    a: (a.additives_tags || []).length,
                    b: (b.additives_tags || []).length,
                    lowerBetter: true
                  },
                  {
                    label: 'Sweeteners detected',
                    a: sweetenerCount(a.ingredients_text),
                    b: sweetenerCount(b.ingredients_text),
                    lowerBetter: true
                  }
                ];

                const priorityMap: Record<string, string> = {
                  'Lower sugar': 'Sugars (per 100g, g)',
                  'Higher protein': 'Protein (per 100g, g)',
                  'Higher fibre': 'Fibre (per 100g, g)',
                  'Lower sodium': 'Sodium (per 100g, mg)',
                  'Fewer sweeteners': 'Sweeteners detected',
                  'Fewer additives': 'Additives listed',
                  'Lower calories': 'Calories (per 100g)'
                };

                const activePrs = compareSelectedPriorities.length
                  ? compareSelectedPriorities
                  : comparePriorities;
                const verdicts = activePrs
                  .map((pr) => {
                    const row = rows.find((r) => r.label === priorityMap[pr]);
                    if (!row || row.a == null || row.b == null || row.a === row.b) return null;
                    const aBetter = row.lowerBetter ? row.a < row.b : row.a > row.b;
                    return {
                      priority: pr.toLowerCase(),
                      winner: aBetter
                        ? a.product_name || 'Product A'
                        : b.product_name || 'Product B'
                    };
                  })
                  .filter(Boolean) as { priority: string; winner: string }[];

                return (
                  <div className="bg-white border border-[#DED6C9] rounded-[28px] p-6 md:p-8 shadow-sm space-y-5">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#DED6C9] text-xs uppercase tracking-wider text-[#26302A]/60">
                            <th className="py-3 px-3 text-left">Metric</th>
                            <th className="py-3 px-3 text-center">
                              {a.product_name || 'Product A'}
                            </th>
                            <th className="py-3 px-3 text-center">
                              {b.product_name || 'Product B'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DED6C9]/70 font-mono">
                          {rows.map((r) => {
                            const av = r.a;
                            const bv = r.b;
                            let awin = false;
                            let bwin = false;
                            if (av != null && bv != null && av !== bv) {
                              if (r.lowerBetter) {
                                awin = av < bv;
                                bwin = bv < av;
                              } else {
                                awin = av > bv;
                                bwin = bv > av;
                              }
                            }
                            return (
                              <tr key={r.label}>
                                <td className="py-3 px-3 text-left font-sans font-medium text-[#26302A]">
                                  {r.label}
                                </td>
                                <td
                                  className={`py-3 px-3 text-center ${
                                    awin ? 'text-[#1E8F4E] font-extrabold' : 'text-[#26302A]'
                                  }`}
                                >
                                  {av != null ? Math.round(av * 10) / 10 : '—'}
                                </td>
                                <td
                                  className={`py-3 px-3 text-center ${
                                    bwin ? 'text-[#1E8F4E] font-extrabold' : 'text-[#26302A]'
                                  }`}
                                >
                                  {bv != null ? Math.round(bv * 10) / 10 : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#F1E6D7] text-left space-y-1.5 text-sm">
                      <strong className="block text-[#26302A] text-base">Before you buy</strong>
                      {verdicts.length > 0 ? (
                        verdicts.map((v) => (
                          <div key={v.priority} className="text-[#26302A]/90">
                            If your priority is <b>{v.priority}</b> → <b>{v.winner}</b>
                          </div>
                        ))
                      ) : (
                        <div>Not enough matching data to compare on the selected priorities.</div>
                      )}
                      <p className="text-xs text-[#26302A]/65 pt-2">
                        KIACHE does not declare a single universal winner — the better choice
                        depends on what matters to you.
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-8 bg-white border border-[#DED6C9] rounded-2xl text-center">
                <p className="text-base font-bold text-[#26302A]">
                  Couldn&apos;t find one or both products.
                </p>
                <p className="text-sm text-[#26302A]/65 mt-1">
                  Double-check the barcodes, or try 8901063141124 and 3017620422003.
                </p>
              </div>
            )}
          </section>
        )}

        {/* PAGE: HISTORY */}
        {activePage === 'history' && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                  {t('historyEyebrow')}
                </p>
                <h2 className="font-serif text-3xl md:text-5xl text-[#26302A] mt-1">
                  {t('yourScans')}
                </h2>
              </div>

              {history.length > 0 && (
                <div className="flex items-center gap-2">
                  {!confirmClearHistory ? (
                    <button
                      type="button"
                      onClick={() => setConfirmClearHistory(true)}
                      className="px-4 py-2.5 rounded-xl border border-[#DED6C9] bg-white text-sm font-bold text-[#26302A] hover:bg-[#F1E1DD]/50 transition cursor-pointer"
                    >
                      {t('clearHistory')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#F1E1DD] px-3 py-1.5 rounded-xl">
                      <span className="text-xs font-bold text-[#8C2E27]">Clear all scans?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setHistory([]);
                          setConfirmClearHistory(false);
                          showToast('History cleared');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#8C2E27] text-white text-xs font-bold cursor-pointer"
                      >
                        Yes, clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearHistory(false)}
                        className="px-2.5 py-1 rounded-lg bg-white text-[#26302A] text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="inline-flex gap-1.5 bg-[#F1EBF7] p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setHistoryFavOnly(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    !historyFavOnly ? 'bg-white text-[#26302A] shadow-sm' : 'text-[#26302A]/70'
                  }`}
                >
                  All scans ({history.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFavOnly(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    historyFavOnly ? 'bg-white text-[#26302A] shadow-sm' : 'text-[#26302A]/70'
                  }`}
                >
                  ★ Favourites ({favouritesCount})
                </button>
              </div>
            )}

            {history.length === 0 ? (
              <div className="bg-white border border-dashed border-[#CFC9BB] rounded-[28px] p-10 text-center space-y-3">
                <MascotTrack />
                <h3 className="font-serif text-3xl text-[#26302A]">Nothing here yet.</h3>
                <p className="text-sm text-[#26302A]/70">
                  Scan your first food label and your saved reads will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('scan')}
                  className="px-6 py-3 rounded-2xl bg-[#3F5D4B] text-white font-bold text-sm cursor-pointer"
                >
                  Scan a label →
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {history
                  .filter((item) => !historyFavOnly || item.favorite)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-[#DED6C9] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="text-center sm:text-left">
                        <strong className="text-lg text-[#26302A]">
                          {item.name} {item.favorite ? '★' : ''}
                        </strong>
                        <div className="text-xs text-[#26302A]/60 mt-0.5">
                          {item.date} · {item.score}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleHistoryFavorite(item.id)}
                          title={item.favorite ? 'Remove favourite' : 'Save favourite'}
                          className="w-9 h-9 rounded-full border border-[#DED6C9] grid place-items-center text-[#26302A] hover:bg-[#F1E6D7] transition cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              item.favorite ? 'fill-[#B89568] text-[#B89568]' : ''
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHistoryEntry(item.id)}
                          title="Delete this scan"
                          className="w-9 h-9 rounded-full border border-[#DED6C9] grid place-items-center text-[#26302A] hover:bg-[#F1E1DD] hover:text-[#8C2E27] transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openHistoryEntry(item)}
                          className="px-4 py-2 rounded-xl border border-[#DED6C9] text-sm font-bold text-[#26302A] hover:bg-[#FBF8F2] transition cursor-pointer"
                        >
                          Open result
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* PAGE: SETTINGS */}
        {activePage === 'settings' && (
          <section className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#26302A]/60">
                {t('settingsEyebrow')}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-[#26302A] mt-1">
                {t('makeKIACHE')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="bg-white border border-[#DED6C9] rounded-[28px] p-7 text-left space-y-5 shadow-sm">
                <h3 className="font-serif text-3xl text-[#26302A]">{t('yourExperience')}</h3>

                <div className="border-b border-[#DED6C9]/70 pb-5">
                  <label className="font-bold block text-base text-[#26302A]">
                    {t('languageLabel')}
                  </label>
                  <small className="text-xs text-[#26302A]/60 block mb-2.5">
                    {t('languageHelp')}
                  </small>
                  <select
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value as LanguageCode);
                      showToast('Language updated');
                    }}
                    className="w-full border border-[#DED6C9] rounded-xl px-4 py-3 text-base bg-white"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="bn">বাংলা</option>
                    <option value="mr">मराठी</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block text-base text-[#26302A]">
                    {t('yourNameLabel')}
                  </label>
                  <small className="text-xs text-[#26302A]/60 block mb-2.5">
                    {t('yourNameHelp')}
                  </small>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your name"
                      className="flex-1 border border-[#DED6C9] rounded-xl px-4 py-3 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUserName(nameInput.trim());
                        showToast('Name saved');
                      }}
                      className="px-5 py-3 rounded-xl bg-[#3F5D4B] text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      {t('saveName')}
                    </button>
                  </div>
                </div>
              </article>

              <article className="bg-white border border-[#DED6C9] rounded-[28px] p-7 text-left space-y-5 shadow-sm">
                <h3 className="font-serif text-3xl text-[#26302A]">{t('dietPrefs')}</h3>

                <div className="border-b border-[#DED6C9]/70 pb-5">
                  <label className="font-bold block text-base text-[#26302A]">
                    {t('usefulPrefs')}
                  </label>
                  <small className="text-xs text-[#26302A]/60 block mb-2.5">
                    {t('prefsHelp')}
                  </small>
                  <div className="flex flex-wrap gap-2">
                    {prefs.map((p) => {
                      const active = selectedPrefs.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePref(p)}
                          className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition cursor-pointer ${
                            active
                              ? 'bg-[#3F5D4B] text-white border-[#3F5D4B]'
                              : 'bg-white text-[#26302A] border-[#DED6C9]'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-bold block text-base text-[#26302A]">
                    {t('allergenAlerts')}
                  </label>
                  <small className="text-xs text-[#26302A]/60 block mb-2.5">
                    {t('allergenHelp')}
                  </small>
                  <div className="flex flex-wrap gap-2">
                    {allergenOptions.map((a) => {
                      const active = selectedAllergens.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleAllergen(a)}
                          className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition cursor-pointer ${
                            active
                              ? 'bg-[#3F5D4B] text-white border-[#3F5D4B]'
                              : 'bg-white text-[#26302A] border-[#DED6C9]'
                          }`}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DED6C9] grid grid-cols-5 px-2 py-1.5">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold ${
            activePage === 'home' ? 'bg-[#B89568] text-[#26302A]' : 'text-[#26302A]/75'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="mt-0.5">{t('home')}</span>
        </button>
        <button
          type="button"
          onClick={() => navigateTo('scan')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold ${
            activePage === 'scan' ? 'bg-[#B89568] text-[#26302A]' : 'text-[#26302A]/75'
          }`}
        >
          <ScanLine className="w-5 h-5" />
          <span className="mt-0.5">{t('scanNav')}</span>
        </button>
        <button
          type="button"
          onClick={() => navigateTo('dictionary')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold ${
            activePage === 'dictionary' ? 'bg-[#B89568] text-[#26302A]' : 'text-[#26302A]/75'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="mt-0.5">{t('dictionaryNav')}</span>
        </button>
        <button
          type="button"
          onClick={() => navigateTo('compare')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold ${
            activePage === 'compare' ? 'bg-[#B89568] text-[#26302A]' : 'text-[#26302A]/75'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="mt-0.5">{t('compareNav')}</span>
        </button>
        <button
          type="button"
          onClick={() => navigateTo('settings')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold ${
            activePage === 'settings' ? 'bg-[#B89568] text-[#26302A]' : 'text-[#26302A]/75'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="mt-0.5">{t('settings')}</span>
        </button>
      </nav>

      {/* Guided Food Q&A Floating Toggle */}
      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        title="Ask KIACHE"
        aria-label="Open KIACHE food knowledge drawer"
        className="fixed right-5 bottom-20 md:bottom-6 z-40 w-14 h-14 rounded-full bg-[#6A4C93] text-white shadow-xl grid place-items-center hover:scale-105 transition cursor-pointer"
      >
        {chatOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>

      {/* Guided Food Q&A Drawer */}
      {chatOpen && (
        <div className="fixed right-4 bottom-36 md:bottom-24 z-40 w-[min(410px,calc(100vw-32px))] bg-white border border-[#DED6C9] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-[#3F5D4B] text-white px-5 py-3.5 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-base">Ask KIACHE</span>
              <span className="text-xs opacity-80 ml-1.5">· Rule-based food knowledge</span>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-2.5 text-sm">
            <div className="p-3 rounded-2xl bg-[#F1EBF7] text-[#26302A] leading-relaxed">
              {t('chatWelcome')}
            </div>

            {(
              [
                ['ingredients', 'aiQIngredients'],
                ['nutrition', 'aiQNutrition'],
                ['allergens', 'aiQAllergens'],
                ['processing', 'aiQProcessing'],
                ['score', 'aiQScore'],
                ['data', 'aiQData']
              ] as const
            ).map(([key, labelKey]) => (
              <button
                key={key}
                type="button"
                onClick={() => triggerGuidedQuestion(key)}
                className="w-full text-left p-3 rounded-2xl border border-[#DED6C9] bg-white hover:bg-[#FBF8F2] font-bold text-[#26302A] text-xs transition cursor-pointer"
              >
                {t(labelKey)}
              </button>
            ))}

            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' || m.role === 'guided-q'
                    ? 'bg-[#E8F0EA] text-[#26302A] font-semibold ml-6'
                    : 'bg-[#F1EBF7] text-[#26302A] mr-4'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2 p-2.5 border-t border-[#DED6C9]">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about an ingredient, e.g. E322 or sucralose…"
              className="flex-1 border border-[#DED6C9] rounded-xl px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3F5D4B] text-white font-bold text-xs cursor-pointer"
            >
              Ask
            </button>
          </form>

          <div className="flex items-center gap-1.5 px-3 pb-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setChatExplainMode('eli5');
                showToast('Explaining simply');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                chatExplainMode === 'eli5'
                  ? 'bg-[#6A4C93] text-white border-[#6A4C93]'
                  : 'bg-white text-[#26302A] border-[#DED6C9]'
              }`}
            >
              Explain simply
            </button>
            <button
              type="button"
              onClick={() => {
                setChatExplainMode('scientist');
                showToast('Explaining like a scientist');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                chatExplainMode === 'scientist'
                  ? 'bg-[#6A4C93] text-white border-[#6A4C93]'
                  : 'bg-white text-[#26302A] border-[#DED6C9]'
              }`}
            >
              Explain like a scientist
            </button>
            <button
              type="button"
              onClick={() => setChatMessages([])}
              className="ml-auto text-[11px] font-bold text-[#26302A]/60 hover:text-[#26302A] cursor-pointer"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50 bg-[#26302A] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

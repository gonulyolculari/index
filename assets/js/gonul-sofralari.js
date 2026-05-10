(() => {
  const app = document.querySelector("[data-sofra-app]");

  if (!app) {
    return;
  }

  const STORAGE_KEY = "gonulSofralariKayitlariV2";
  const SESSION_KEY = "gonulSofralariAktifGirisV1";
  const AUTH_KEY = "gonulSofralariLoginAktifV1";
  const SIDEBAR_KEY = "gonulSofralariYanMenuDarV1";
  const NOTIFICATION_KEY = "gonulSofralariBildirimleriV1";
  const DEFAULT_PASSWORD = "1234";
  const LOGIN_DOMAIN = "gonul.local";

  const statuses = [
    "Yeni Bildirim",
    "Dağıtıcı Bekleniyor",
    "Dağıtıcı Atandı",
    "Teslim Alındı",
    "Vakıfa Teslim Edildi",
    "Tamamlandı",
    "İptal Edildi",
  ];

  const progressSteps = [
    "Yeni Bildirim",
    "Dağıtıcı Bekleniyor",
    "Dağıtıcı Atandı",
    "Teslim Alındı",
    "Vakıfa Teslim Edildi",
    "Tamamlandı",
  ];

  const statusTones = {
    "Yeni Bildirim": "new",
    "Dağıtıcı Bekleniyor": "waiting",
    "Dağıtıcı Atandı": "assigned",
    "Teslim Alındı": "picked",
    "Vakıfa Teslim Edildi": "foundation",
    Tamamlandı: "done",
    "İptal Edildi": "cancelled",
  };

  const roleMeta = {
    provider: {
      label: "Yurt / Yardım Veren Kurum",
      panel: "Yeni Sipariş Paneli",
      description: "Bu ekranda yalnızca seçili kurumun oluşturduğu sipariş kayıtları görünür.",
    },
    receiver: {
      label: "Vakıf / Teslim Alacak Ekip",
      panel: "Vakıf Sipariş Alım Paneli",
      description: "Bekleyen siparişleri üstlenebilir, kendi üstlendiğiniz kayıtların tüm detaylarını takip edebilirsiniz.",
    },
    distributor: {
      label: "Dağıtan Kişi",
      panel: "Dağıtım Sipariş Paneli",
      description: "Size atanmış veya dağıtıcı bekleyen yemek bildirimleri listelenir ve işlem yapılabilir.",
    },
    admin: {
      label: "Vakıf / Yönetici",
      panel: "Vakıf Yönetici Paneli",
      description: "Tüm yemek bildirimleri, dağıtıcı atamaları ve durum hareketleri bu ekrandan yönetilir.",
    },
  };

  function toLoginSlug(value) {
    return String(value || "")
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const foundationNames = [
    "LÖSEV",
    "Mehmetçik Vakfı",
    "Maarif Vakfı",
    "Mütevelli Vakfı",
    "Nesin Vakfı",
    "Nuh Çimento Eğitim ve Sağlık Vakfı",
    "Okan Eğitim Vakfı",
    "ÖNDER",
    "Özel Sektör Gönüllüleri Derneği",
    "Rahmi M. Koç Müzecilik ve Kültür Vakfı",
    "Sabancı Vakfı",
    "Sadakataşı Derneği",
    "Sağlık ve Eğitim Vakfı",
    "SEDAV",
    "Semerkand Vakfı",
    "SMA Vakfı",
    "Sosyal Yardımlaşma ve Dayanışma Vakfı",
    "Suna ve İnan Kıraç Vakfı",
    "T3 Vakfı",
    "Tarih Vakfı",
    "TEMA Vakfı",
    "TEV",
    "TEGEV",
    "TOÇEV",
    "TOG",
    "TÜBİTAK Vakfı",
    "Türk Böbrek Vakfı",
    "Türk Eğitim Derneği",
    "Türk Kalp Vakfı",
    "Türk Kızılay",
    "Türk Lösemi Vakfı",
    "Türk Polis Teşkilatını Güçlendirme Vakfı",
    "Türk Silahlı Kuvvetlerini Güçlendirme Vakfı",
    "Türkiye Diyanet Vakfı",
    "Türkiye Eğitim Vakfı",
    "Türkiye Maarif Vakfı",
    "Türkiye Teknoloji Takımı Vakfı",
    "TÜRGEV",
    "TÜRVAK",
    "UNICEF Türkiye",
    "Vehbi Koç Vakfı",
    "Yeşilay",
    "Yeryüzü Doktorları",
    "Yunus Emre Vakfı",
    "Zihinsel Yetersiz Çocukları Yetiştirme ve Koruma Vakfı",
    "Zorlu Vakfı",
    "İHH",
    "İlim Yayma Vakfı",
    "İnsan Vakfı",
    "İyilikder",
  ];

  const dormUsers = [
    {
      id: "yurt-fsm-ogrenci",
      role: "provider",
      name: "FSM Öğrenci Yurdu",
      detail: "Yurt hesabı",
      accountGroup: "Yurtlar",
      email: "fsm-ogrenci-yurdu@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "yurt-fethiye-ogrenci",
      role: "provider",
      name: "Fethiye Öğrenci Yurdu",
      detail: "Yurt hesabı",
      accountGroup: "Yurtlar",
      email: "fethiye-ogrenci-yurdu@gonul.local",
      password: DEFAULT_PASSWORD,
    },
  ];

  const foundationUsers = foundationNames.map((name, index) => ({
    id: `vakif-${String(index + 1).padStart(2, "0")}`,
    role: "receiver",
    name,
    detail: "Vakıf teslim alma hesabı",
    accountGroup: "Vakıflar",
    email: `${toLoginSlug(name)}@${LOGIN_DOMAIN}`,
    password: DEFAULT_PASSWORD,
  }));

  const users = [
    {
      id: "demo-yurt",
      role: "provider",
      name: "Yurt Kullanıcısı",
      detail: "Demo yurt / yemek veren hesabı",
      accountGroup: "Demo Kullanıcılar",
      email: "yurt@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "kurum-bereket",
      role: "provider",
      name: "Bereket Fırını",
      detail: "Fatih şubesi",
      accountGroup: "Yardım Veren Kurumlar",
      email: "bereket-firini@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "kurum-hisar",
      role: "provider",
      name: "Hisar Öğrenci Yurdu",
      detail: "Yemekhane sorumlusu",
      accountGroup: "Yardım Veren Kurumlar",
      email: "hisar-ogrenci-yurdu@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "kurum-sefa",
      role: "provider",
      name: "Sefa Lokantası",
      detail: "Toplu yemek mutfağı",
      accountGroup: "Yardım Veren Kurumlar",
      email: "sefa-lokantasi@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    ...dormUsers,
    {
      id: "ekip-fatih",
      role: "receiver",
      name: "Fatih Teslim Ekibi",
      detail: "Teslim alma ekibi",
      accountGroup: "Teslim Ekipleri",
      email: "fatih-teslim-ekibi@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "ekip-eyup",
      role: "receiver",
      name: "Eyüp Teslim Ekibi",
      detail: "Teslim alma ekibi",
      accountGroup: "Teslim Ekipleri",
      email: "eyup-teslim-ekibi@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    ...foundationUsers,
    {
      id: "demo-dagitici",
      role: "distributor",
      name: "Dağıtıcı Kullanıcı",
      detail: "Demo dağıtıcı hesabı",
      accountGroup: "Demo Kullanıcılar",
      email: "dagitici@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "dagitim-ali",
      role: "distributor",
      name: "Ali Kaya",
      detail: "Dağıtım gönüllüsü",
      accountGroup: "Dağıtım",
      email: "ali-kaya@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "dagitim-zeynep",
      role: "distributor",
      name: "Zeynep Demir",
      detail: "Dağıtım gönüllüsü",
      accountGroup: "Dağıtım",
      email: "zeynep-demir@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "demo-vakif-yoneticisi",
      role: "admin",
      name: "Vakıf Yöneticisi",
      detail: "Demo vakıf yönetici hesabı",
      accountGroup: "Demo Kullanıcılar",
      email: "vakif@gonul.local",
      password: DEFAULT_PASSWORD,
    },
    {
      id: "admin-merkez",
      role: "admin",
      name: "Merkez Admin",
      detail: "Genel koordinasyon",
      accountGroup: "Admin",
      email: "admin@gonul.local",
      password: DEFAULT_PASSWORD,
    },
  ];

  const seedRecords = [
    {
      id: "rec-001",
      recordNo: "GS-2026-001",
      institutionId: "kurum-bereket",
      institutionName: "Bereket Fırını",
      helpType: "Sıcak yemek",
      amount: "120 porsiyon",
      pickupDate: "2026-05-08",
      pickupTime: "18:30",
      address: "Fatih, Akşemsettin Mah. Vatan Cad. No: 24",
      description: "Mercimek çorbası ve tavuklu pilav paketli halde hazır.",
      privateNote: "18:15 sonrası arka kapıdan teslim alınabilir.",
      readiness: "Hazır",
      status: "Hazır",
      receiverId: "",
      receiverName: "",
      distributorId: "",
      distributorName: "",
      distributionRegion: "Fatih merkez",
      distributionNote: "Öncelik yaşlı haneler.",
      photoName: "",
      createdAt: "2026-05-08T10:20:00+03:00",
      updatedAt: "2026-05-08T12:05:00+03:00",
      history: [
        { status: "Hazır", actor: "Bereket Fırını", at: "2026-05-08T10:20:00+03:00" },
      ],
    },
    {
      id: "rec-002",
      recordNo: "GS-2026-002",
      institutionId: "kurum-hisar",
      institutionName: "Hisar Öğrenci Yurdu",
      helpType: "Kuru gıda",
      amount: "34 koli",
      pickupDate: "2026-05-09",
      pickupTime: "11:00",
      address: "Üsküdar, Selami Ali Mah. Gönül Sok. No: 7",
      description: "Makarna, bakliyat ve konserve kolileri teslim edilmeye uygun.",
      privateNote: "Araç için iç bahçeye giriş yapılabilir.",
      readiness: "Bekliyor",
      status: "Bekliyor",
      receiverId: "",
      receiverName: "",
      distributorId: "",
      distributorName: "",
      distributionRegion: "Üsküdar sahil hattı",
      distributionNote: "Aile listesi admin tarafından paylaşılacak.",
      photoName: "",
      createdAt: "2026-05-08T09:10:00+03:00",
      updatedAt: "2026-05-08T09:45:00+03:00",
      history: [
        { status: "Bekliyor", actor: "Hisar Öğrenci Yurdu", at: "2026-05-08T09:10:00+03:00" },
      ],
    },
    {
      id: "rec-003",
      recordNo: "GS-2026-003",
      institutionId: "kurum-sefa",
      institutionName: "Sefa Lokantası",
      helpType: "Çorba ve ekmek",
      amount: "80 porsiyon",
      pickupDate: "2026-05-08",
      pickupTime: "20:00",
      address: "Eyüp, Nişanca Mah. Kemer Sok. No: 18",
      description: "Kapalı kaplarda sıcak çorba ve ayrı paketlenmiş ekmek.",
      privateNote: "Teslim sırasında kap adedi kontrol edilecek.",
      readiness: "Hazır",
      status: "Teslim Alınacak",
      receiverId: "ekip-eyup",
      receiverName: "Eyüp Teslim Ekibi",
      distributorId: "",
      distributorName: "",
      distributionRegion: "Eyüp merkez",
      distributionNote: "Akşam dağıtımına hazırlanacak.",
      photoName: "",
      createdAt: "2026-05-08T08:40:00+03:00",
      updatedAt: "2026-05-08T13:00:00+03:00",
      history: [
        { status: "Hazır", actor: "Sefa Lokantası", at: "2026-05-08T08:40:00+03:00" },
        { status: "Teslim Alınacak", actor: "Eyüp Teslim Ekibi", at: "2026-05-08T13:00:00+03:00" },
      ],
    },
    {
      id: "rec-004",
      recordNo: "GS-2026-004",
      institutionId: "kurum-bereket",
      institutionName: "Bereket Fırını",
      helpType: "Ekmek",
      amount: "260 adet",
      pickupDate: "2026-05-07",
      pickupTime: "17:45",
      address: "Fatih, Akşemsettin Mah. Vatan Cad. No: 24",
      description: "Gün sonu ihtiyaç fazlası ekmekler kasalarda teslim edildi.",
      privateNote: "Kasalar ertesi gün iade edilecek.",
      readiness: "Hazır",
      status: "Teslim Alındı",
      receiverId: "ekip-fatih",
      receiverName: "Fatih Teslim Ekibi",
      distributorId: "dagitim-ali",
      distributorName: "Ali Kaya",
      distributionRegion: "Sulukule ve çevresi",
      distributionNote: "Çocuklu aileler öncelikli.",
      photoName: "",
      createdAt: "2026-05-07T13:15:00+03:00",
      updatedAt: "2026-05-07T18:05:00+03:00",
      history: [
        { status: "Hazır", actor: "Bereket Fırını", at: "2026-05-07T13:15:00+03:00" },
        { status: "Teslim Alınacak", actor: "Fatih Teslim Ekibi", at: "2026-05-07T16:30:00+03:00" },
        { status: "Teslim Alındı", actor: "Fatih Teslim Ekibi", at: "2026-05-07T18:05:00+03:00" },
      ],
    },
    {
      id: "rec-005",
      recordNo: "GS-2026-005",
      institutionId: "kurum-hisar",
      institutionName: "Hisar Öğrenci Yurdu",
      helpType: "Kahvaltılık",
      amount: "95 paket",
      pickupDate: "2026-05-06",
      pickupTime: "09:30",
      address: "Üsküdar, Selami Ali Mah. Gönül Sok. No: 7",
      description: "Peynir, zeytin ve poğaça içeren kahvaltı paketleri.",
      privateNote: "Soğuk zincir gerekmiyor, aynı gün dağıtım önerilir.",
      readiness: "Hazır",
      status: "Dağıtımda",
      receiverId: "ekip-fatih",
      receiverName: "Fatih Teslim Ekibi",
      distributorId: "dagitim-zeynep",
      distributorName: "Zeynep Demir",
      distributionRegion: "Haseki ve Cerrahpaşa",
      distributionNote: "Hastane refakatçi listesine göre dağıtılıyor.",
      photoName: "",
      createdAt: "2026-05-06T07:50:00+03:00",
      updatedAt: "2026-05-06T10:25:00+03:00",
      history: [
        { status: "Hazır", actor: "Hisar Öğrenci Yurdu", at: "2026-05-06T07:50:00+03:00" },
        { status: "Teslim Alındı", actor: "Fatih Teslim Ekibi", at: "2026-05-06T09:45:00+03:00" },
        { status: "Dağıtımda", actor: "Zeynep Demir", at: "2026-05-06T10:25:00+03:00" },
      ],
    },
    {
      id: "rec-006",
      recordNo: "GS-2026-006",
      institutionId: "kurum-sefa",
      institutionName: "Sefa Lokantası",
      helpType: "Sıcak yemek",
      amount: "150 porsiyon",
      pickupDate: "2026-05-05",
      pickupTime: "19:10",
      address: "Eyüp, Nişanca Mah. Kemer Sok. No: 18",
      description: "Pilav, kuru fasulye ve ayran dağıtım paketleri.",
      privateNote: "Boş kaplar kayıtlı teslim alınacak.",
      readiness: "Hazır",
      status: "Dağıtıldı",
      receiverId: "ekip-eyup",
      receiverName: "Eyüp Teslim Ekibi",
      distributorId: "dagitim-ali",
      distributorName: "Ali Kaya",
      distributionRegion: "Alibeyköy",
      distributionNote: "Dağıtım tamamlandı, 43 hane ulaşıldı.",
      photoName: "",
      createdAt: "2026-05-05T15:35:00+03:00",
      updatedAt: "2026-05-05T21:15:00+03:00",
      history: [
        { status: "Hazır", actor: "Sefa Lokantası", at: "2026-05-05T15:35:00+03:00" },
        { status: "Teslim Alındı", actor: "Eyüp Teslim Ekibi", at: "2026-05-05T19:25:00+03:00" },
        { status: "Dağıtımda", actor: "Ali Kaya", at: "2026-05-05T19:45:00+03:00" },
        { status: "Dağıtıldı", actor: "Ali Kaya", at: "2026-05-05T21:15:00+03:00" },
      ],
    },
    {
      id: "rec-007",
      recordNo: "GS-2026-007",
      institutionId: "kurum-bereket",
      institutionName: "Bereket Fırını",
      helpType: "Tatlı",
      amount: "45 paket",
      pickupDate: "2026-05-04",
      pickupTime: "16:00",
      address: "Fatih, Akşemsettin Mah. Vatan Cad. No: 24",
      description: "Paketli sütlü tatlı, raf ömrü kısa olduğu için hızlı dağıtım gerekir.",
      privateNote: "Stok kontrolünde sayı eksik çıktığı için iptal edildi.",
      readiness: "Bekliyor",
      status: "İptal Edildi",
      receiverId: "",
      receiverName: "",
      distributorId: "",
      distributorName: "",
      distributionRegion: "Fatih merkez",
      distributionNote: "İptal nedeniyle dağıtım yapılmadı.",
      photoName: "",
      createdAt: "2026-05-04T11:05:00+03:00",
      updatedAt: "2026-05-04T14:30:00+03:00",
      history: [
        { status: "Bekliyor", actor: "Bereket Fırını", at: "2026-05-04T11:05:00+03:00" },
        { status: "İptal Edildi", actor: "Merkez Admin", at: "2026-05-04T14:30:00+03:00" },
      ],
    },
    {
      id: "rec-008",
      recordNo: "GS-2026-008",
      institutionId: "yurt-fsm-ogrenci",
      institutionName: "FSM Öğrenci Yurdu",
      helpType: "Akşam yemeği",
      amount: "110 porsiyon",
      pickupDate: "2026-05-08",
      pickupTime: "19:20",
      address: "Fatih, Fevzipaşa Cad. FSM Öğrenci Yurdu mutfak girişi",
      description: "Paketli çorba, pilav ve ana yemek dağıtıma uygun şekilde hazırlandı.",
      privateNote: "Teslim alma ekibi danışmadan mutfak sorumlusunu arasın.",
      readiness: "Hazır",
      status: "Hazır",
      receiverId: "",
      receiverName: "",
      distributorId: "",
      distributorName: "",
      distributionRegion: "Fatih ve çevresi",
      distributionNote: "Öğrenci gönüllüler destek verebilir.",
      photoName: "",
      createdAt: "2026-05-08T14:15:00+03:00",
      updatedAt: "2026-05-08T14:15:00+03:00",
      history: [
        { status: "Hazır", actor: "FSM Öğrenci Yurdu", at: "2026-05-08T14:15:00+03:00" },
      ],
    },
    {
      id: "rec-009",
      recordNo: "GS-2026-009",
      institutionId: "yurt-fethiye-ogrenci",
      institutionName: "Fethiye Öğrenci Yurdu",
      helpType: "Kahvaltı paketi",
      amount: "70 paket",
      pickupDate: "2026-05-09",
      pickupTime: "08:40",
      address: "Fethiye Mah. Fethiye Öğrenci Yurdu yemekhane kapısı",
      description: "Poğaça, peynir, zeytin ve meyve suyu içeren paketler.",
      privateNote: "Sabah 09:30 öncesi teslim alınması önerilir.",
      readiness: "Bekliyor",
      status: "Bekliyor",
      receiverId: "",
      receiverName: "",
      distributorId: "",
      distributorName: "",
      distributionRegion: "Fethiye çevresi",
      distributionNote: "Sabah dağıtım listesi hazırlanacak.",
      photoName: "",
      createdAt: "2026-05-08T15:05:00+03:00",
      updatedAt: "2026-05-08T15:05:00+03:00",
      history: [
        { status: "Bekliyor", actor: "Fethiye Öğrenci Yurdu", at: "2026-05-08T15:05:00+03:00" },
      ],
    },
  ];

  const orderFallbacks = {
    "rec-001": {
      documentNo: "A25000110",
      processNo: "TKL260014",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
    "rec-002": {
      documentNo: "A25000109",
      processNo: "A25000109",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
    "rec-003": {
      documentNo: "A25000107",
      processNo: "A25000107",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
    "rec-004": {
      documentNo: "A25000101",
      processNo: "A25000101",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
    "rec-005": {
      documentNo: "A25000100",
      processNo: "A25000100",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
    "rec-006": {
      documentNo: "A25000092",
      processNo: "A25000092",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
    "rec-007": {
      documentNo: "A25000091",
      processNo: "A25000091",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
    "rec-008": {
      documentNo: "A25000069",
      processNo: "A25000069",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
    "rec-009": {
      documentNo: "A25000061",
      processNo: "A25000061",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
    },
  };

  const els = {
    accountEmail: document.getElementById("accountEmail"),
    accountLoginSelect: document.getElementById("accountLoginSelect"),
    accountPassword: document.getElementById("accountPassword"),
    activeRoleLabel: document.getElementById("activeRoleLabel"),
    contextPanel: document.getElementById("contextPanel"),
    drawer: document.getElementById("recordDrawer"),
    drawerBackdrop: document.getElementById("drawerBackdrop"),
    drawerContent: document.getElementById("drawerContent"),
    metricGrid: document.getElementById("metricGrid"),
    pageSize: document.getElementById("pageSize"),
    paginationBar: document.getElementById("paginationBar"),
    panelDescription: document.getElementById("panelDescription"),
    panelTitle: document.getElementById("panelTitle"),
    loginAccountCount: document.getElementById("loginAccountCount"),
    loginAccountList: document.getElementById("loginAccountList"),
    loggedAccountLabel: document.getElementById("loggedAccountLabel"),
    loginForm: document.getElementById("sofraLoginForm"),
    logoutButton: document.getElementById("logoutSofraUser"),
    resetData: document.getElementById("resetSofraData"),
    roleTabs: Array.from(document.querySelectorAll(".sofra-role-tab")),
    sidebarToggle: document.getElementById("sofraSidebarToggle"),
    screenCards: document.getElementById("screenCards"),
    tableBody: document.getElementById("recordsTableBody"),
    tableHead: document.getElementById("recordsTableHead"),
    tableSearch: document.getElementById("tableSearch"),
    tableStateBar: document.getElementById("tableStateBar"),
    toast: document.getElementById("sofraToast"),
    userSelect: document.getElementById("userSelect"),
  };

  const initialSessionUser = getInitialSessionUser();
  const initialAuthenticated = hasActiveSession();
  let records = normalizeRecords(loadRecords());
  let notifications = normalizeLegacyDormData(loadNotifications());
  let lastNotificationSoundId = "";
  let notificationReminderTimer = null;
  let state = {
    isAuthenticated: initialAuthenticated,
    role: initialSessionUser.role,
    userId: initialSessionUser.id,
    loggedInUserId: initialSessionUser.id,
    page: 1,
    pageSize: 8,
    search: "",
    dateFrom: "2023-01-01",
    dateTo: "2026-12-31",
    filtersVisible: true,
    notificationsOpen: false,
    notificationReminderDue: 0,
    sidebarCollapsed: getStoredSidebarState(),
    sort: { key: "pickupDate", dir: "desc" },
    filters: {},
    selected: new Set(),
    drawerId: "",
  };

  function cloneRecords(source) {
    return JSON.parse(JSON.stringify(source));
  }

  function cleanLegacyDormText(value) {
    if (typeof value !== "string") {
      return value;
    }

    const legacySuffix = `${"i"}yc`;
    const legacyTag = "\u0130YC";

    return value
      .replace(new RegExp(`yurt-fsm-${legacySuffix}`, "g"), "yurt-fsm-ogrenci")
      .replace(new RegExp(`yurt-fethiye-${legacySuffix}`, "g"), "yurt-fethiye-ogrenci")
      .replace(new RegExp(`fsm-yurdu-${legacySuffix}@gonul\\.local`, "g"), "fsm-ogrenci-yurdu@gonul.local")
      .replace(new RegExp(`fethiye-yurdu-${legacySuffix}@gonul\\.local`, "g"), "fethiye-ogrenci-yurdu@gonul.local")
      .replace(new RegExp(`FSM Yurdu ${legacyTag}`, "g"), "FSM Öğrenci Yurdu")
      .replace(new RegExp(`Fethiye Yurdu ${legacyTag}`, "g"), "Fethiye Öğrenci Yurdu")
      .replace(new RegExp(`${legacyTag} FSM Yurdu`, "g"), "FSM Öğrenci Yurdu")
      .replace(new RegExp(`${legacyTag} Fethiye Yurdu`, "g"), "Fethiye Öğrenci Yurdu")
      .replace(new RegExp(`\\s*${legacyTag}\\s*`, "g"), " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function normalizeLegacyDormData(value) {
    if (Array.isArray(value)) {
      return value.map((item) => normalizeLegacyDormData(item));
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, normalizeLegacyDormData(item)])
      );
    }

    return cleanLegacyDormText(value);
  }

  function normalizeStatus(status) {
    // Older demo data is migrated in-place so existing localStorage records keep working.
    const statusMap = {
      Hazır: "Dağıtıcı Bekleniyor",
      Bekliyor: "Yeni Bildirim",
      "Teslim Alınacak": "Dağıtıcı Atandı",
      Dağıtımda: "Vakıfa Teslim Edildi",
      Dağıtıldı: "Tamamlandı",
    };

    return statusMap[status] || status || "Yeni Bildirim";
  }

  function normalizeRecord(record) {
    const normalizedStatus = normalizeStatus(record.status);
    const history = (record.history || []).map((item) => ({
      ...item,
      status: normalizeStatus(item.status),
    }));

    return {
      ...record,
      availableUntil: record.availableUntil || record.deadlineTime || "",
      readiness: normalizeStatus(record.readiness),
      status: normalizedStatus,
      history: history.length ? history : [{ status: normalizedStatus, actor: record.institutionName || "Sistem", at: record.createdAt || new Date().toISOString() }],
    };
  }

  function normalizeRecords(source) {
    return normalizeLegacyDormData(source).map(normalizeRecord);
  }

  function loadRecords() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : cloneRecords(seedRecords);
    } catch (error) {
      return cloneRecords(seedRecords);
    }
  }

  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function loadNotifications() {
    try {
      const stored = localStorage.getItem(NOTIFICATION_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  function saveNotifications() {
    try {
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
    } catch (error) {
      // Local demo storage may be unavailable in strict browser modes.
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getInitialSessionUser() {
    try {
      const storedUserId = localStorage.getItem(SESSION_KEY);
      return users.find((user) => user.id === storedUserId) || users.find((user) => user.id === "admin-merkez");
    } catch (error) {
      return users.find((user) => user.id === "admin-merkez");
    }
  }

  function hasActiveSession() {
    try {
      return localStorage.getItem(AUTH_KEY) === "1" && Boolean(localStorage.getItem(SESSION_KEY));
    } catch (error) {
      return false;
    }
  }

  function saveSessionUser(userId) {
    try {
      localStorage.setItem(SESSION_KEY, userId);
      localStorage.setItem(AUTH_KEY, "1");
    } catch (error) {
      // Local demo storage may be unavailable in strict browser modes.
    }
  }

  function clearSessionUser() {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      // Local demo storage may be unavailable in strict browser modes.
    }
  }

  function getStoredSidebarState() {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function saveSidebarState() {
    try {
      localStorage.setItem(SIDEBAR_KEY, state.sidebarCollapsed ? "1" : "0");
    } catch (error) {
      // Local demo storage may be unavailable in strict browser modes.
    }
  }

  function getLoginEmail(user) {
    return user?.email || `${user.id}@${LOGIN_DOMAIN}`;
  }

  function findLoginUser(value) {
    const loginValue = String(value || "").trim().toLowerCase();

    if (!loginValue) {
      return null;
    }

    if (["admin", "admin@gonul.local", "merkez@gonul.local"].includes(loginValue)) {
      return users.find((user) => user.id === "admin-merkez");
    }

    return users.find((user) => {
      return (
        getLoginEmail(user).toLowerCase() === loginValue ||
        String(user.email || "").toLowerCase() === loginValue ||
        user.id.toLowerCase() === loginValue ||
        user.name.toLowerCase() === loginValue
      );
    });
  }

  function getLoggedInUser() {
    return users.find((user) => user.id === state.loggedInUserId) || users.find((user) => user.id === "admin-merkez");
  }

  function isAdminSession() {
    return getLoggedInUser()?.role === "admin";
  }

  function canOpenRole(role) {
    const loggedUser = getLoggedInUser();
    return loggedUser.role === "admin" || loggedUser.role === role;
  }

  function getCurrentUser() {
    return users.find((user) => user.id === state.userId) || users.find((user) => user.role === state.role);
  }

  function getUsersByRole(role) {
    return users.filter((user) => user.role === role);
  }

  function getUserName(id) {
    return users.find((user) => user.id === id)?.name || "";
  }

  function getVisibleNotifications() {
    const user = getLoggedInUser();

    if (!user) {
      return [];
    }

    if (user.role === "admin") {
      return notifications;
    }

    return notifications.filter((notification) => {
      const roleMatch = Array.isArray(notification.targetRoles) && notification.targetRoles.includes(user.role);
      const userMatch = Array.isArray(notification.targetUserIds) && notification.targetUserIds.includes(user.id);
      return roleMatch || userMatch;
    });
  }

  function getUnreadNotificationCount() {
    const user = getLoggedInUser();

    if (!user) {
      return 0;
    }

    return getUnreadNotifications().length;
  }

  function getUnreadNotifications() {
    const user = getLoggedInUser();

    if (!user) {
      return [];
    }

    return getVisibleNotifications().filter((notification) => !notification.readBy?.includes(user.id));
  }

  function addNotification(notification) {
    const user = getCurrentUser();

    notifications = [
      {
        id: `note-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: notification.title,
        message: notification.message,
        type: notification.type || "info",
        recordId: notification.recordId || "",
        targetRoles: notification.targetRoles || [],
        targetUserIds: notification.targetUserIds || [],
        details: notification.details || [],
        createdAt: new Date().toISOString(),
        createdBy: user?.name || "Sistem",
        readBy: [],
      },
      ...notifications,
    ].slice(0, 60);

    saveNotifications();
  }

  function markNotificationsRead() {
    const user = getLoggedInUser();

    if (!user) {
      return;
    }

    const visibleIds = new Set(getVisibleNotifications().map((notification) => notification.id));
    let changed = false;

    notifications = notifications.map((notification) => {
      if (!visibleIds.has(notification.id) || notification.readBy?.includes(user.id)) {
        return notification;
      }

      changed = true;
      return { ...notification, readBy: [...(notification.readBy || []), user.id] };
    });

    if (changed) {
      saveNotifications();
    }
  }

  function markNotificationRead(notificationId) {
    const user = getLoggedInUser();

    if (!user || !notificationId) {
      return;
    }

    let changed = false;
    notifications = notifications.map((notification) => {
      if (notification.id !== notificationId || notification.readBy?.includes(user.id)) {
        return notification;
      }

      changed = true;
      return { ...notification, readBy: [...(notification.readBy || []), user.id] };
    });

    if (changed) {
      saveNotifications();
    }
  }

  function scheduleNotificationReminder() {
    window.clearTimeout(notificationReminderTimer);

    if (!state.notificationReminderDue || !getUnreadNotifications().length) {
      return;
    }

    const delay = Math.max(0, state.notificationReminderDue - Date.now());
    notificationReminderTimer = window.setTimeout(() => {
      state.notificationReminderDue = 0;
      renderOrderToolbar();
      showToast("Okunmamış bildiriminiz var.");
    }, delay);
  }

  function playNotificationSound(notificationId) {
    if (!notificationId || lastNotificationSoundId === notificationId) {
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      const audioContext = new AudioContext();
      const startSound = () => {
        lastNotificationSoundId = notificationId;
        const gain = audioContext.createGain();
        const first = audioContext.createOscillator();
        const second = audioContext.createOscillator();

        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.36);

        first.type = "sine";
        first.frequency.setValueAtTime(760, audioContext.currentTime);
        second.type = "sine";
        second.frequency.setValueAtTime(960, audioContext.currentTime + 0.12);

        first.connect(gain);
        second.connect(gain);
        gain.connect(audioContext.destination);

        first.start(audioContext.currentTime);
        first.stop(audioContext.currentTime + 0.18);
        second.start(audioContext.currentTime + 0.13);
        second.stop(audioContext.currentTime + 0.36);

        window.setTimeout(() => audioContext.close(), 520);
      };

      if (audioContext.state === "suspended") {
        audioContext.resume().then(startSound, () => audioContext.close());
      } else {
        startSound();
      }
    } catch (error) {
      // Some browsers block audio until the first user gesture.
    }
  }

  function getRecordNotificationDetails(record) {
    return [
      ["Yurt / yemek veren", record.institutionName],
      ["Yemek türü", record.helpType],
      ["Miktar / kişi sayısı", record.amount],
      ["Konum", record.address],
      ["Hazır olma saati", record.pickupTime || "-"],
      ["Son alınabilirlik", record.availableUntil || "-"],
      ["Açıklama", record.description || "-"],
      ["Durum", record.status],
    ];
  }

  // Role-aware notification helpers keep each update scoped to the users who need it.
  function notifyFoodCreated(record) {
    const targetUserIds = users
      .filter((user) => ["receiver", "distributor", "admin"].includes(user.role))
      .map((user) => user.id);

    addNotification({
      type: "new",
      recordId: record.id,
      targetRoles: ["receiver", "distributor", "admin"],
      targetUserIds,
      title: "Yeni yemek bildirimi",
      message: `${record.institutionName}, ${record.amount} ${record.helpType} için yeni bildirim oluşturdu.`,
      details: getRecordNotificationDetails(record),
    });
  }

  function notifyRecordStatus(record, title, targetRoles = ["admin"], targetUserIds = []) {
    addNotification({
      type: statusTones[record.status] || "info",
      recordId: record.id,
      targetRoles,
      targetUserIds: [record.institutionId, ...targetUserIds].filter(Boolean),
      title,
      message: `${record.recordNo} durumu: ${record.status}. ${record.distributorName ? `Dağıtıcı: ${record.distributorName}.` : ""}`,
      details: getRecordNotificationDetails(record),
    });
  }

  function notifyDelivered(record) {
    notifyRecordStatus(record, "Teslim tamamlandı", ["admin"], [record.receiverId]);
  }

  function getVisibleRecords() {
    const user = getCurrentUser();

    if (!user) {
      return [];
    }

    if (state.role === "provider") {
      return records.filter((record) => record.institutionId === user.id);
    }

    if (state.role === "receiver") {
      return records.filter((record) => {
        const isOpenFoodNotice = ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(record.status);
        const isAvailable = !record.receiverId && !record.distributorId && isOpenFoodNotice;
        const isMine = record.receiverId === user.id;
        return isAvailable || isMine;
      });
    }

    if (state.role === "distributor") {
      return records.filter((record) => {
        const isOpenFoodNotice = ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(record.status);
        const isAvailable = !record.distributorId && isOpenFoodNotice;
        const isMine = record.distributorId === user.id;
        return isAvailable || isMine;
      });
    }

    return records;
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  }

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function getDistributionState(record) {
    if (["Teslim Alındı", "Vakıfa Teslim Edildi", "Tamamlandı", "İptal Edildi"].includes(record.status)) {
      return record.status;
    }

    if (record.distributorName) {
      return `${record.distributorName} atandı`;
    }

    return "Dağıtıcı bekleniyor";
  }

  function getOrderField(record, key, fallback = "") {
    const value = record[key] ?? orderFallbacks[record.id]?.[key];
    return value ?? fallback;
  }

  function getOrderDocumentNo(record) {
    return getOrderField(record, "documentNo", record.recordNo);
  }

  function getOrderProcessNo(record) {
    return getOrderField(record, "processNo", getOrderDocumentNo(record));
  }

  function getOrderUserLabel(record) {
    return getOrderField(record, "userLabel", "DEMO KU");
  }

  function getOrderStatus(record) {
    return getOrderField(record, "orderStatus", "Onaysız");
  }

  function renderOrderUser(record) {
    const label = getOrderUserLabel(record);
    const initials = label
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toLocaleUpperCase("tr-TR");

    return `
      <span class="sofra-order-user">
        <span class="sofra-order-avatar">${escapeHtml(initials || "KU")}</span>
        <span>${escapeHtml(label)}</span>
      </span>
    `;
  }

  function renderOrderApproval(record) {
    const status = getOrderStatus(record);
    const toneMap = {
      "Onaysız": "pending",
      "Onaylı": "approved",
      "Hazır": "ready",
      "İptal": "cancelled",
    };
    return `<span class="sofra-order-approval sofra-order-approval-${toneMap[status] || "pending"}">${escapeHtml(status)}</span>`;
  }

  function renderMoreAction(record) {
    return `<button class="sofra-more-btn" type="button" data-action="detail" data-id="${escapeHtml(record.id)}" aria-label="${escapeHtml(getOrderDocumentNo(record))} detay">...</button>`;
  }

  function getColumnCatalog() {
    return {
      select: {
        key: "select",
        label: "",
        type: "select",
        className: "sofra-col-check",
        sortable: false,
        filterable: false,
        render: (record) => `
          <input class="sofra-row-check" type="checkbox" data-check-id="${escapeHtml(record.id)}" ${state.selected.has(record.id) ? "checked" : ""} aria-label="${escapeHtml(record.recordNo)} seç">
        `,
      },
      pickupDate: {
        key: "pickupDate",
        label: "Tarih",
        raw: (record) => record.pickupDate,
        value: (record) => formatDate(record.pickupDate),
      },
      pickupTime: {
        key: "pickupTime",
        label: "Hazır Saat",
        raw: (record) => record.pickupTime,
        value: (record) => record.pickupTime,
      },
      availableUntil: {
        key: "availableUntil",
        label: "Son Saat",
        raw: (record) => record.availableUntil,
        value: (record) => record.availableUntil || "-",
      },
      recordNo: {
        key: "recordNo",
        label: "Belge No",
        value: (record) => record.recordNo,
      },
      documentNo: {
        key: "documentNo",
        label: "Belge No",
        raw: (record) => getOrderDocumentNo(record),
        value: (record) => getOrderDocumentNo(record),
      },
      altAccount: {
        key: "altAccount",
        label: "Alt Hesap",
        value: (record) => getOrderField(record, "altAccount", ""),
      },
      processNo: {
        key: "processNo",
        label: "Süreç No",
        raw: (record) => getOrderProcessNo(record),
        value: (record) => getOrderProcessNo(record),
      },
      institutionName: {
        key: "institutionName",
        label: "Firma Adı",
        value: (record) => record.institutionName,
      },
      orderUser: {
        key: "orderUser",
        label: "Kullanıcı",
        value: (record) => getOrderUserLabel(record),
        render: (record) => renderOrderUser(record),
      },
      orderStatus: {
        key: "orderStatus",
        label: "Onay Durumu",
        filterType: "orderStatus",
        raw: (record) => getOrderStatus(record),
        value: (record) => getOrderStatus(record),
        render: (record) => renderOrderApproval(record),
      },
      helpType: {
        key: "helpType",
        label: "Yemek Türü",
        value: (record) => record.helpType,
      },
      amount: {
        key: "amount",
        label: "Miktar",
        value: (record) => record.amount,
      },
      address: {
        key: "address",
        label: "Adres",
        className: "sofra-col-wide",
        value: (record) => record.address,
      },
      description: {
        key: "description",
        label: "Açıklama",
        className: "sofra-col-wide",
        value: (record) => record.description,
      },
      privateNote: {
        key: "privateNote",
        label: "Not",
        className: "sofra-col-wide",
        value: (record) => record.privateNote || "-",
      },
      createdAt: {
        key: "createdAt",
        label: "Oluşturulma",
        raw: (record) => record.createdAt,
        value: (record) => formatDateTime(record.createdAt),
      },
      updatedAt: {
        key: "updatedAt",
        label: "Son Güncelleme",
        raw: (record) => record.updatedAt,
        value: (record) => formatDateTime(record.updatedAt),
      },
      receiverName: {
        key: "receiverName",
        label: "Alacak Kişi",
        value: (record) => record.receiverName || "Atanmadı",
      },
      distributorName: {
        key: "distributorName",
        label: "Dağıtan Kişi",
        value: (record) => record.distributorName || "Atanmadı",
      },
      distributionRegion: {
        key: "distributionRegion",
        label: "Dağıtım Bölgesi",
        value: (record) => record.distributionRegion || "-",
      },
      distributionNote: {
        key: "distributionNote",
        label: "Dağıtım Notu",
        className: "sofra-col-wide",
        value: (record) => record.distributionNote || "-",
      },
      distributionStatus: {
        key: "distributionStatus",
        label: "Dağıtım Durumu",
        value: (record) => getDistributionState(record),
      },
      status: {
        key: "status",
        label: "Süreç Durumu",
        filterType: "status",
        raw: (record) => record.status,
        value: (record) => record.status,
        render: (record) => renderInlineStatus(record),
      },
      action: {
        key: "action",
        label: "İşlem",
        sortable: false,
        filterable: false,
        render: (record) => renderRowAction(record),
      },
      more: {
        key: "more",
        label: "...",
        sortable: false,
        filterable: false,
        render: (record) => renderMoreAction(record),
      },
    };
  }

  function getColumns() {
    const catalog = getColumnCatalog();
    const byRole = {
      provider: [
        "pickupTime",
        "availableUntil",
        "helpType",
        "amount",
        "status",
        "distributionStatus",
        "action",
      ],
      receiver: [
        "institutionName",
        "helpType",
        "amount",
        "pickupTime",
        "availableUntil",
        "status",
        "action",
      ],
      distributor: [
        "pickupTime",
        "availableUntil",
        "helpType",
        "amount",
        "institutionName",
        "status",
        "action",
      ],
      admin: [
        "pickupTime",
        "availableUntil",
        "institutionName",
        "helpType",
        "amount",
        "status",
        "distributorName",
        "more",
      ],
    };

    return byRole[state.role].map((key) => catalog[key]);
  }

  function getColumnText(record, column) {
    if (column.value) {
      return String(column.value(record));
    }

    return String(record[column.key] ?? "");
  }

  function getColumnRaw(record, column) {
    if (column.raw) {
      return column.raw(record);
    }

    return getColumnText(record, column);
  }

  function getFilteredSortedRecords() {
    const columns = getColumns();
    const search = state.search.trim().toLocaleLowerCase("tr-TR");

    let rows = getVisibleRecords().filter((record) => {
      const searchable = [
        record.recordNo,
        getOrderDocumentNo(record),
        getOrderProcessNo(record),
        record.institutionName,
        getOrderUserLabel(record),
        getOrderStatus(record),
        record.helpType,
        record.amount,
        record.availableUntil,
        record.address,
        record.description,
        record.privateNote,
        record.receiverName,
        record.distributorName,
        record.status,
        record.distributionRegion,
        record.distributionNote,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      if (search && !searchable.includes(search)) {
        return false;
      }

      if (state.dateFrom && record.pickupDate < state.dateFrom) {
        return false;
      }

      if (state.dateTo && record.pickupDate > state.dateTo) {
        return false;
      }

      return columns.every((column) => {
        if (column.filterable === false || column.type === "select") {
          return true;
        }

        const filter = String(state.filters[column.key] || "").trim().toLocaleLowerCase("tr-TR");

        if (!filter) {
          return true;
        }

        return getColumnText(record, column).toLocaleLowerCase("tr-TR").includes(filter);
      });
    });

    const sortColumn = columns.find((column) => column.key === state.sort.key);

    if (sortColumn) {
      rows = rows.sort((first, second) => {
        const firstRaw = getColumnRaw(first, sortColumn);
        const secondRaw = getColumnRaw(second, sortColumn);

        if (typeof firstRaw === "number" && typeof secondRaw === "number") {
          return state.sort.dir === "asc" ? firstRaw - secondRaw : secondRaw - firstRaw;
        }

        const firstValue = String(firstRaw ?? "").toLocaleLowerCase("tr-TR");
        const secondValue = String(secondRaw ?? "").toLocaleLowerCase("tr-TR");
        return state.sort.dir === "asc"
          ? firstValue.localeCompare(secondValue, "tr")
          : secondValue.localeCompare(firstValue, "tr");
      });
    }

    return rows;
  }

  function renderStatusBadge(status) {
    return `<span class="sofra-status sofra-status-${statusTones[status] || "neutral"}">${escapeHtml(status)}</span>`;
  }

  function getAllowedStatuses(record) {
    const user = getCurrentUser();

    if (state.role === "admin") {
      return statuses;
    }

    if (state.role === "provider" && record.institutionId === user.id && ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(record.status)) {
      return ["Yeni Bildirim", "Dağıtıcı Bekleniyor", "İptal Edildi"];
    }

    if (state.role === "receiver" && record.receiverId === user.id) {
      return ["Dağıtıcı Atandı", "Teslim Alındı", "Vakıfa Teslim Edildi", "Tamamlandı"];
    }

    if (state.role === "distributor" && record.distributorId === user.id) {
      return ["Dağıtıcı Atandı", "Teslim Alındı", "Vakıfa Teslim Edildi", "Tamamlandı"];
    }

    return [];
  }

  function renderInlineStatus(record) {
    const allowed = getAllowedStatuses(record);

    if (!allowed.length) {
      return renderStatusBadge(record.status);
    }

    return `
      <label class="sofra-inline-status">
        ${renderStatusBadge(record.status)}
        <select data-status-inline="${escapeHtml(record.id)}" aria-label="${escapeHtml(record.recordNo)} durum değiştir">
          ${allowed
            .map(
              (status) =>
                `<option value="${escapeHtml(status)}" ${status === record.status ? "selected" : ""}>${escapeHtml(status)}</option>`
            )
            .join("")}
        </select>
      </label>
    `;
  }

  function renderRowAction(record) {
    const user = getCurrentUser();
    const canReceiverClaim = state.role === "receiver" && !record.receiverId && ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(record.status);
    const canDistributorClaim = state.role === "distributor" && !record.distributorId && ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(record.status);
    const isMine = state.role === "receiver" && record.receiverId === user.id;
    const isDistributorMine = state.role === "distributor" && record.distributorId === user.id;

    if (canReceiverClaim || canDistributorClaim) {
      return `<button class="sofra-mini-btn" type="button" data-action="claim" data-id="${escapeHtml(record.id)}">Kabul Et</button>`;
    }

    if (state.role === "admin") {
      return `<button class="sofra-mini-btn" type="button" data-action="detail" data-id="${escapeHtml(record.id)}">Düzenle</button>`;
    }

    if (isMine || isDistributorMine) {
      return `<button class="sofra-mini-btn" type="button" data-action="detail" data-id="${escapeHtml(record.id)}">Detay</button>`;
    }

    return `<button class="sofra-mini-btn" type="button" data-action="detail" data-id="${escapeHtml(record.id)}">Detay</button>`;
  }

  function renderRoleControls() {
    const loggedUser = getLoggedInUser();

    if (loggedUser.role !== "admin" && state.role !== loggedUser.role) {
      state.role = loggedUser.role;
      state.userId = loggedUser.id;
    }

    els.roleTabs.forEach((button) => {
      const isActive = button.dataset.role === state.role;
      const locked = !canOpenRole(button.dataset.role);
      button.classList.toggle("is-active", isActive);
      button.classList.toggle("is-locked", locked);
      button.disabled = locked;
      button.setAttribute("aria-pressed", String(isActive));
    });

    const roleUsers = isAdminSession() ? getUsersByRole(state.role) : [loggedUser];

    if (!roleUsers.some((user) => user.id === state.userId)) {
      state.userId = roleUsers[0]?.id || loggedUser.id;
    }

    els.userSelect.innerHTML = roleUsers
      .map(
        (user) => `
          <option value="${escapeHtml(user.id)}" ${user.id === state.userId ? "selected" : ""}>
            ${escapeHtml(user.name)}
          </option>
        `
      )
      .join("");
    els.userSelect.disabled = !isAdminSession();

    els.activeRoleLabel.textContent = roleMeta[state.role].panel;
    els.loggedAccountLabel.textContent = `${loggedUser.name} hesabı açık`;
    els.panelTitle.textContent = roleMeta[state.role].panel;
    els.panelDescription.textContent = roleMeta[state.role].description;
  }

  function getUsersByGroup() {
    return users.reduce((groups, user) => {
      const group = user.accountGroup || roleMeta[user.role].label;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(user);
      return groups;
    }, {});
  }

  function renderLoginPanel() {
    if (!els.accountEmail && !els.accountLoginSelect && !els.loginAccountList) {
      return;
    }

    const groups = getUsersByGroup();
    const groupOrder = ["Demo Kullanıcılar", "Vakıflar", "Yurtlar", "Yardım Veren Kurumlar", "Teslim Ekipleri", "Dağıtım", "Admin"];
    const loggedUser = getLoggedInUser();
    const visibleLoginUsers = users.filter((user) => ["Vakıflar", "Yurtlar"].includes(user.accountGroup));

    if (els.accountLoginSelect) {
      els.accountLoginSelect.innerHTML = groupOrder
        .filter((group) => groups[group]?.length)
        .map(
          (group) => `
            <optgroup label="${escapeHtml(group)}">
              ${groups[group]
                .map(
                  (user) => `
                    <option value="${escapeHtml(user.id)}" ${user.id === loggedUser.id ? "selected" : ""}>
                      ${escapeHtml(user.name)} - ${escapeHtml(roleMeta[user.role].label)}
                    </option>
                  `
                )
                .join("")}
            </optgroup>
          `
        )
        .join("");
    }

    if (els.loginAccountCount) {
      els.loginAccountCount.textContent = `${visibleLoginUsers.length} hesap`;
    }

    if (els.loginAccountList) {
      els.loginAccountList.innerHTML = visibleLoginUsers
        .map(
          (user) => `
            <button class="sofra-login-account ${user.id === els.accountLoginSelect?.value ? "is-selected" : ""}" type="button" data-login-user="${escapeHtml(user.id)}">
              <strong>${escapeHtml(user.name)}</strong>
              <span>${escapeHtml(user.accountGroup)} - ${escapeHtml(roleMeta[user.role].label)}</span>
            </button>
          `
        )
        .join("");
    }
  }

  function renderNotificationPanel() {
    const visible = getUnreadNotifications().slice(0, 8);
    const user = getLoggedInUser();

    if (!visible.length) {
      return `
        <div class="sofra-notification-panel ${state.notificationsOpen ? "is-open" : ""}">
          <div class="sofra-notification-empty">Yeni bildirim yok.</div>
        </div>
      `;
    }

    return `
      <div class="sofra-notification-panel ${state.notificationsOpen ? "is-open" : ""}">
        ${visible
          .map(
            (notification) => `
              <button class="sofra-notification-item sofra-notification-${escapeHtml(notification.type)} ${notification.readBy?.includes(user.id) ? "" : "is-unread"}" type="button" data-notification-action="detail" data-note-id="${escapeHtml(notification.id)}" data-id="${escapeHtml(notification.recordId)}">
                <span></span>
                <div>
                  <strong>${escapeHtml(notification.title)}</strong>
                  <p>${escapeHtml(notification.message)}</p>
                  ${
                    notification.details?.length
                      ? `<dl>${notification.details
                          .slice(0, 4)
                          .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
                          .join("")}</dl>`
                      : ""
                  }
                  <small>${escapeHtml(formatDateTime(notification.createdAt))}</small>
                </div>
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderNotificationPopup(unreadNotifications) {
    if (!unreadNotifications.length) {
      return "";
    }

    if (state.notificationReminderDue && Date.now() < state.notificationReminderDue) {
      return "";
    }

    const latest = unreadNotifications[0];
    const extraCount = unreadNotifications.length - 1;

    return `
      <div class="sofra-notification-popup" role="alertdialog" aria-live="assertive" aria-label="Yeni bildirim">
        <div class="sofra-notification-popup-card sofra-notification-${escapeHtml(latest.type)}">
          <span class="sofra-notification-popup-icon">!</span>
          <div class="sofra-notification-popup-copy">
            <small>Yeni bildirim${extraCount ? ` &middot; ${unreadNotifications.length} okunmamış` : ""}</small>
            <h3>${escapeHtml(latest.title)}</h3>
            <p>${escapeHtml(latest.message)}</p>
            ${
              latest.details?.length
                ? `<dl>${latest.details
                    .filter(([label]) => ["Yurt / yemek veren", "Yemek türü", "Miktar / kişi sayısı", "Son alınabilirlik"].includes(label))
                    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
                    .join("")}</dl>`
                : ""
            }
          </div>
          <div class="sofra-notification-popup-actions">
            <button class="sofra-btn sofra-btn-ghost" type="button" data-notification-action="remind-later">Sonra hatırlat</button>
            <button class="sofra-btn sofra-btn-ghost" type="button" data-notification-action="read-all">Okudum</button>
            <button class="sofra-btn sofra-btn-primary" type="button" data-notification-action="detail" data-note-id="${escapeHtml(latest.id)}" data-id="${escapeHtml(latest.recordId)}">Detaya git</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderOrderToolbar() {
    const panel = document.querySelector(".sofra-table-panel");

    if (!panel) {
      return;
    }

    let toolbar = document.getElementById("sofraOrderToolbar");

    if (!toolbar) {
      panel.insertAdjacentHTML("afterbegin", `<div class="sofra-order-shell" id="sofraOrderToolbar"></div>`);
      toolbar = document.getElementById("sofraOrderToolbar");
    }

    panel.classList.toggle("is-filter-collapsed", !state.filtersVisible);

    const title = state.role === "admin" ? "Canlı Yemek Bildirimleri" : `${roleMeta[state.role].label} Bildirimleri`;
    const selectedCount = state.selected.size;
    const unreadNotifications = getUnreadNotifications();
    const unreadCount = unreadNotifications.length;

    toolbar.innerHTML = `
      <div class="sofra-order-topbar">
        <div class="sofra-order-title">
          <button class="sofra-order-menu" type="button" data-order-action="filter" aria-label="Filtreleri aç veya kapat">☰</button>
          <strong>${escapeHtml(title)}</strong>
          <button class="sofra-order-caret" type="button" data-order-action="filter" aria-label="Filtreleri aç veya kapat">⌄</button>
        </div>
        <div class="sofra-order-tools" aria-label="Sipariş işlemleri">
          <button type="button" data-order-action="add"><span>+</span>Ekle</button>
          <button type="button" data-order-action="save"><span>✓</span>Kaydet</button>
          <button type="button" data-order-action="filter"><span>▽</span>Filtreler</button>
          ${state.role === "admin" ? `<button type="button" data-order-action="delete" ${selectedCount ? "" : "disabled"}><span>-</span>Sil</button>` : ""}
          <button class="sofra-notification-button ${unreadCount ? "has-unread" : ""}" type="button" data-order-action="notifications"><span>!</span>Bildirim${unreadCount ? `<i>${unreadCount}</i>` : ""}</button>
        </div>
      </div>

      <div class="sofra-order-filterbar">
        <label class="sofra-order-date">
          <span>Tarih aralığı</span>
          <input type="date" value="${escapeHtml(state.dateFrom)}" data-order-date="dateFrom">
          <input type="date" value="${escapeHtml(state.dateTo)}" data-order-date="dateTo">
        </label>
        <label class="sofra-order-search">
          <span>Arama</span>
          <input type="search" value="${escapeHtml(state.search)}" placeholder="Arama" data-order-search>
        </label>
        <button class="sofra-order-filter-button" type="button" data-order-action="apply-filter">Filtrele</button>
      </div>
      ${renderNotificationPanel()}
      ${renderNotificationPopup(unreadNotifications)}
    `;

    scheduleNotificationReminder();

    if (unreadNotifications.length && (!state.notificationReminderDue || Date.now() >= state.notificationReminderDue)) {
      playNotificationSound(unreadNotifications[0].id);
    }
  }

  function renderMetrics() {
    const visible = getVisibleRecords();
    const metrics = [
      { label: "Toplam yardım", value: visible.length, tone: "total" },
      { label: "Yeni bildirim", value: visible.filter((record) => record.status === "Yeni Bildirim").length, tone: "ready" },
      { label: "Dağıtıcı bekliyor", value: visible.filter((record) => record.status === "Dağıtıcı Bekleniyor").length, tone: "waiting" },
      {
        label: "Teslim alınan",
        value: visible.filter((record) => ["Teslim Alındı", "Vakıfa Teslim Edildi", "Tamamlandı"].includes(record.status)).length,
        tone: "picked",
      },
      { label: "Tamamlanan", value: visible.filter((record) => record.status === "Tamamlandı").length, tone: "done" },
    ];

    els.metricGrid.innerHTML = metrics
      .map(
        (metric) => `
          <article class="sofra-metric sofra-metric-${metric.tone}">
            <span>${escapeHtml(metric.label)}</span>
            <strong>${metric.value}</strong>
          </article>
        `
      )
      .join("");
  }

  function getRoleCardUser(role) {
    if (state.role === role) {
      return getCurrentUser();
    }

    const loggedUser = getLoggedInUser();

    if (loggedUser.role === role) {
      return loggedUser;
    }

    return getUsersByRole(role)[0];
  }

  function getRoleCardStats(role, user) {
    if (role === "provider") {
      const mine = records.filter((record) => record.institutionId === user?.id);
      return [
        ["Toplam kayıt", mine.length],
        ["Yeni", mine.filter((record) => record.status === "Yeni Bildirim").length],
      ];
    }

    if (role === "receiver") {
      const available = records.filter((record) => !record.receiverId && !record.distributorId && ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(record.status)).length;
      const mine = records.filter((record) => record.receiverId === user?.id).length;
      return [
        ["Bekleyen", available],
        ["Üstlenilen", mine],
      ];
    }

    if (role === "distributor") {
      const mine = records.filter((record) => record.distributorId === user?.id);
      return [
        ["Toplam kayıt", mine.length],
        ["Aktif", mine.filter((record) => ["Dağıtıcı Atandı", "Teslim Alındı", "Vakıfa Teslim Edildi"].includes(record.status)).length],
      ];
    }

    return [
      ["Tüm kayıt", records.length],
      ["Aktif", records.filter((record) => !["Tamamlandı", "İptal Edildi"].includes(record.status)).length],
    ];
  }

  function renderScreenCards() {
    if (!els.screenCards) {
      return;
    }

    const cards = [
      {
        role: "provider",
        kicker: "Yurt / yemek veren",
        text: "Kendi yemek bildirimlerini oluşturma ve süreç takibi.",
      },
      {
        role: "receiver",
        kicker: "Teslim alma ekranı",
        text: "Bekleyen kayıtları üstlenme ve teslim durumunu takip etme.",
      },
      {
        role: "distributor",
        kicker: "Dağıtım ekranı",
        text: "Uygun bildirimleri kabul etme ve teslim durumlarını güncelleme.",
      },
      {
        role: "admin",
        kicker: "Vakıf / yönetici",
        text: "Tüm bildirimler, atamalar, iptaller ve tamamlanan kayıtlar.",
      },
    ];

    els.screenCards.innerHTML = cards
      .map((card) => {
        const user = getRoleCardUser(card.role);
        const stats = getRoleCardStats(card.role, user);
        const locked = !canOpenRole(card.role);
        return `
          <button class="sofra-screen-card ${state.role === card.role ? "is-active" : ""} ${locked ? "is-locked" : ""}" type="button" data-screen-role="${escapeHtml(card.role)}" ${locked ? "disabled" : ""}>
            <div>
              <span class="sofra-kicker">${escapeHtml(card.kicker)}</span>
              <h3>${escapeHtml(user?.name || roleMeta[card.role].panel)}</h3>
              <p>${escapeHtml(card.text)}</p>
            </div>
            <div class="sofra-screen-card-stats">
              ${stats
                .map(
                  ([label, value]) => `
                    <div>
                      <strong>${value}</strong>
                      <span>${escapeHtml(label)}</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          </button>
        `;
      })
      .join("");
  }

  function renderContextPanel() {
    const user = getCurrentUser();

    if (state.role === "provider") {
      els.contextPanel.innerHTML = `
        <div class="sofra-panel-heading">
          <span class="sofra-kicker">Yeni yardım kaydı</span>
          <h3>${escapeHtml(user.name)}</h3>
          <p>Bu formdan oluşturulan yemek bildirimleri dağıtıcı paneline ve vakıf yönetici paneline anında düşer.</p>
        </div>

        <form class="sofra-form" id="aidForm">
          <label>
            <span>Yemek türü</span>
            <input name="helpType" type="text" placeholder="Sıcak yemek, çorba, ekmek" required>
          </label>

          <label>
            <span>Miktar / porsiyon</span>
            <input name="amount" type="text" placeholder="120 porsiyon" required>
          </label>

          <div class="sofra-form-grid">
            <label>
              <span>Hazır olma saati</span>
              <input name="pickupTime" type="time" required>
            </label>
            <label>
              <span>Son alınabilirlik</span>
              <input name="availableUntil" type="time" required>
            </label>
          </div>

          <label>
            <span>Adres</span>
            <textarea name="address" rows="2" placeholder="Teslim alınacak açık adres" required></textarea>
          </label>

          <label>
            <span>Açıklama</span>
            <textarea name="description" rows="3" placeholder="Yardım içeriği, paketleme bilgisi, teslim detayı"></textarea>
          </label>

          <button class="sofra-btn sofra-btn-primary" type="submit">Bildirim Oluştur</button>
        </form>
      `;
      return;
    }

    if (state.role === "receiver") {
      const visible = getVisibleRecords();
      const available = visible.filter((record) => !record.receiverId && !record.distributorId && ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(record.status)).length;
      const mine = visible.filter((record) => record.receiverId === user.id).length;

      els.contextPanel.innerHTML = `
        <div class="sofra-panel-heading">
          <span class="sofra-kicker">Teslim alma ekranı</span>
          <h3>${escapeHtml(user.name)}</h3>
          <p>Bekleyen kayıtları üstlenebilir, üstlendiğiniz kayıtların durumunu değiştirebilirsiniz.</p>
        </div>
        <div class="sofra-mini-stats">
          <div><strong>${available}</strong><span>Uygun kayıt</span></div>
          <div><strong>${mine}</strong><span>Üstlenilen</span></div>
        </div>
        <button class="sofra-btn sofra-btn-primary" type="button" data-panel-action="claim-selected">Seçili kaydı üstlen</button>
      `;
      return;
    }

    if (state.role === "distributor") {
      const mine = getVisibleRecords();
      const active = mine.filter((record) => ["Dağıtıcı Atandı", "Teslim Alındı", "Vakıfa Teslim Edildi"].includes(record.status)).length;

      els.contextPanel.innerHTML = `
        <div class="sofra-panel-heading">
          <span class="sofra-kicker">Dağıtım ekranı</span>
          <h3>${escapeHtml(user.name)}</h3>
          <p>Size atanmış kayıtları ve dağıtıcı bekleyen uygun yemek bildirimlerini gösterir.</p>
        </div>
        <div class="sofra-mini-stats">
          <div><strong>${mine.length}</strong><span>Toplam kayıt</span></div>
          <div><strong>${active}</strong><span>Aktif süreç</span></div>
        </div>
      `;
      return;
    }

    const grouped = ["provider", "receiver", "distributor", "admin"]
      .map((role) => {
        const roleUsers = getUsersByRole(role);
        return `
          <details class="sofra-user-group" ${role === "provider" ? "open" : ""}>
            <summary>
              <strong>${escapeHtml(roleMeta[role].label)}</strong>
              <span>${roleUsers.length} hesap</span>
            </summary>
            <div class="sofra-user-list">
              ${roleUsers
                .map(
                  (item) => `
                    <article class="sofra-user-item">
                      <strong>${escapeHtml(item.name)}</strong>
                      <span>${escapeHtml(item.detail)}</span>
                      <small>${escapeHtml(getLoginEmail(item))}</small>
                    </article>
                  `
                )
                .join("")}
            </div>
          </details>
        `;
      })
      .join("");

    const completedCount = records.filter((record) => record.status === "Tamamlandı").length;
    const deliveredCount = records.filter((record) => ["Teslim Alındı", "Vakıfa Teslim Edildi"].includes(record.status)).length;
    const cancelledCount = records.filter((record) => record.status === "İptal Edildi").length;

    els.contextPanel.innerHTML = `
      <div class="sofra-panel-heading">
        <span class="sofra-kicker">Kullanıcılar ve yetkiler</span>
        <h3>Admin izleme alanı</h3>
        <p>Hesaplar rol gruplarına ayrıldı. Kalabalık listeleri açıp kapatarak daha rahat kontrol edebilirsiniz.</p>
      </div>
      <div class="sofra-mini-stats">
        <div><strong>${deliveredCount}</strong><span>Teslim alınan</span></div>
        <div><strong>${completedCount}</strong><span>Tamamlanan</span></div>
        <div><strong>${cancelledCount}</strong><span>İptal</span></div>
      </div>
      <div class="sofra-user-groups">${grouped}</div>
    `;
  }

  function renderTableHead() {
    const columns = getColumns();

    els.tableHead.innerHTML = `
      <tr>
        ${columns
          .map((column) => {
            if (column.type === "select") {
              const visibleIds = getFilteredSortedRecords().map((record) => record.id);
              const allSelected = visibleIds.length > 0 && visibleIds.every((id) => state.selected.has(id));
              return `
                <th class="${column.className || ""}">
                  <input type="checkbox" data-check-all ${allSelected ? "checked" : ""} aria-label="Görünen kayıtları seç">
                </th>
              `;
            }

            const sortable = column.sortable !== false;
            const mark = state.sort.key === column.key ? (state.sort.dir === "asc" ? "↑" : "↓") : "↕";

            return `
              <th class="${column.className || ""}">
                ${
                  sortable
                    ? `<button class="sofra-sort-btn" type="button" data-sort="${escapeHtml(column.key)}">${escapeHtml(column.label)} <span>${mark}</span></button>`
                    : `<span>${escapeHtml(column.label)}</span>`
                }
              </th>
            `;
          })
          .join("")}
      </tr>
      <tr class="sofra-filter-row">
        ${columns
          .map((column) => {
            if (column.filterable === false || column.type === "select") {
              return `<th class="${column.className || ""}"></th>`;
            }

            if (column.filterType === "status") {
              return `
                <th>
                  <select data-filter="${escapeHtml(column.key)}" aria-label="${escapeHtml(column.label)} filtrele">
                    <option value="">Tümü</option>
                    ${statuses
                      .map(
                        (status) =>
                          `<option value="${escapeHtml(status)}" ${state.filters[column.key] === status ? "selected" : ""}>${escapeHtml(status)}</option>`
                      )
                      .join("")}
                  </select>
                </th>
              `;
            }

            if (column.filterType === "orderStatus") {
              const orderStatuses = ["Onaysız", "Onaylı", "Hazır", "İptal"];
              return `
                <th>
                  <select data-filter="${escapeHtml(column.key)}" aria-label="${escapeHtml(column.label)} filtrele">
                    <option value="">Tümü</option>
                    ${orderStatuses
                      .map(
                        (status) =>
                          `<option value="${escapeHtml(status)}" ${state.filters[column.key] === status ? "selected" : ""}>${escapeHtml(status)}</option>`
                      )
                      .join("")}
                  </select>
                </th>
              `;
            }

            return `
              <th class="${column.className || ""}">
                <input data-filter="${escapeHtml(column.key)}" type="text" value="${escapeHtml(state.filters[column.key] || "")}" placeholder="Filtrele">
              </th>
            `;
          })
          .join("")}
      </tr>
    `;
  }

  function renderTableBody() {
    const columns = getColumns();
    const rows = getFilteredSortedRecords();
    const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    const start = (state.page - 1) * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);

    if (!pageRows.length) {
      els.tableBody.innerHTML = `
        <tr>
          <td class="sofra-empty" colspan="${columns.length}">
            Bu görünüm için kayıt bulunamadı.
          </td>
        </tr>
      `;
    } else {
      els.tableBody.innerHTML = pageRows
        .map(
          (record) => `
            <tr data-record-id="${escapeHtml(record.id)}" class="${state.selected.has(record.id) ? "is-selected" : ""}">
              ${columns
                .map((column) => {
                  const content = column.render ? column.render(record) : escapeHtml(getColumnText(record, column));
                  return `<td class="${column.className || ""}" data-label="${escapeHtml(column.label)}">${content}</td>`;
                })
                .join("")}
            </tr>
          `
        )
        .join("");
    }

    renderTableState(rows.length, pageRows.length);
    renderPagination(rows.length, totalPages);
  }

  function renderTableState(total, shown) {
    const selectedCount = state.selected.size;
    const roleLabel = roleMeta[state.role].label;

    els.tableStateBar.innerHTML = `
      <span>${escapeHtml(roleLabel)} görünümünde ${total} kayıt</span>
      <span>Bu sayfada ${shown} satır</span>
      <span>${selectedCount} seçili satır</span>
    `;
  }

  function renderPagination(total, totalPages) {
    const start = total ? (state.page - 1) * state.pageSize + 1 : 0;
    const end = Math.min(total, state.page * state.pageSize);

    els.paginationBar.innerHTML = `
      <span>${start}-${end} / ${total}</span>
      <div>
        <button class="sofra-mini-btn" type="button" data-page="prev" ${state.page <= 1 ? "disabled" : ""}>Önceki</button>
        <strong>${state.page} / ${totalPages}</strong>
        <button class="sofra-mini-btn" type="button" data-page="next" ${state.page >= totalPages ? "disabled" : ""}>Sonraki</button>
      </div>
    `;
  }

  function renderAuthState() {
    app.classList.toggle("is-authenticated", state.isAuthenticated);
    app.classList.toggle("sofra-order-mode", state.isAuthenticated);
    app.classList.toggle("is-sidebar-collapsed", state.sidebarCollapsed);
    document.body.classList.toggle("sofra-login-mode", !state.isAuthenticated);

    if (els.sidebarToggle) {
      els.sidebarToggle.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
      els.sidebarToggle.setAttribute(
        "aria-label",
        state.sidebarCollapsed ? "Yan menüyü genişlet" : "Yan menüyü daralt"
      );
    }
  }

  function renderAll() {
    state.selected.clear();
    renderAuthState();
    renderLoginPanel();

    if (!state.isAuthenticated) {
      return;
    }

    renderRoleControls();
    renderOrderToolbar();
    renderScreenCards();
    renderMetrics();
    renderContextPanel();
    renderTableHead();
    renderTableBody();

    if (state.drawerId) {
      renderDrawer();
    }
  }

  function renderTableOnly() {
    if (!state.isAuthenticated) {
      renderAuthState();
      return;
    }

    renderRoleControls();
    renderOrderToolbar();
    renderScreenCards();
    renderMetrics();
    renderContextPanel();
    renderTableHead();
    renderTableBody();

    if (state.drawerId) {
      renderDrawer();
    }
  }

  function getNextRecordNo() {
    const max = records.reduce((highest, record) => {
      const number = Number(String(record.recordNo).split("-").pop()) || 0;
      return Math.max(highest, number);
    }, 0);

    return `GS-2026-${String(max + 1).padStart(3, "0")}`;
  }

  function getNextDocumentNo() {
    const max = records.reduce((highest, record) => {
      const digits = String(getOrderDocumentNo(record)).replace(/\D/g, "");
      return Math.max(highest, Number(digits) || 0);
    }, 25000000);

    return `A${String(max + 1).padStart(8, "0")}`;
  }

  function getNextProcessNo() {
    const max = records.reduce((highest, record) => {
      const digits = String(getOrderProcessNo(record)).replace(/\D/g, "");
      return Math.max(highest, Number(digits) || 0);
    }, 260000);

    return `TKL${String(max + 1).padStart(6, "0")}`;
  }

  function createRecord(form) {
    const user = getCurrentUser();
    const formData = new FormData(form);
    const now = new Date().toISOString();
    const readiness = "Yeni Bildirim";
    const documentNo = getNextDocumentNo();
    const today = new Date().toISOString().slice(0, 10);

    const record = {
      id: `rec-${Date.now()}`,
      recordNo: getNextRecordNo(),
      documentNo,
      processNo: getNextProcessNo(),
      altAccount: "",
      userLabel: "DEMO KU",
      orderStatus: "Onaysız",
      institutionId: user.id,
      institutionName: user.name,
      helpType: String(formData.get("helpType") || "").trim(),
      amount: String(formData.get("amount") || "").trim(),
      pickupDate: today,
      pickupTime: String(formData.get("pickupTime") || ""),
      availableUntil: String(formData.get("availableUntil") || ""),
      address: String(formData.get("address") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      privateNote: "",
      readiness,
      status: readiness,
      receiverId: "",
      receiverName: "",
      distributorId: "",
      distributorName: "",
      distributionRegion: "",
      distributionNote: "",
      photoName: "",
      createdAt: now,
      updatedAt: now,
      history: [{ status: readiness, actor: user.name, at: now }],
    };

    records = [record, ...records];
    saveRecords();
    notifyFoodCreated(record);
    form.reset();
    state.page = 1;
    renderTableOnly();
    showToast(`${documentNo} oluşturuldu. Bildirim dağıtıcı ve vakıf paneline gönderildi.`);
  }

  function updateRecord(recordId, updater, message) {
    const user = getCurrentUser();
    const now = new Date().toISOString();
    let changedRecord = null;
    let previousStatus = "";

    records = records.map((record) => {
      if (record.id !== recordId) {
        return record;
      }

      const beforeStatus = record.status;
      previousStatus = beforeStatus;
      const nextRecord = { ...record };
      updater(nextRecord);
      nextRecord.updatedAt = now;

      if (nextRecord.status !== beforeStatus) {
        nextRecord.history = [
          ...(nextRecord.history || []),
          { status: nextRecord.status, actor: user.name, at: now },
        ];
      }

      changedRecord = nextRecord;
      return nextRecord;
    });

    saveRecords();
    if (changedRecord && changedRecord.status !== previousStatus) {
      if (changedRecord.status === "Dağıtıcı Atandı") {
        notifyRecordStatus(changedRecord, "Dağıtıcı atandı", ["admin"], [changedRecord.receiverId, changedRecord.distributorId]);
      }

      if (changedRecord.status === "Teslim Alındı") {
        notifyRecordStatus(changedRecord, "Yemek teslim alındı", ["admin"], [changedRecord.receiverId]);
      }

      if (changedRecord.status === "Vakıfa Teslim Edildi") {
        notifyRecordStatus(changedRecord, "Yemek vakıfa teslim edildi", ["admin"], [changedRecord.receiverId]);
      }

      if (changedRecord.status === "Tamamlandı") {
        notifyDelivered(changedRecord);
      }

      if (changedRecord.status === "İptal Edildi") {
        notifyRecordStatus(changedRecord, "Bildirim iptal edildi", ["admin"], [changedRecord.receiverId, changedRecord.distributorId]);
      }
    }
    renderTableOnly();

    if (message) {
      showToast(message);
    }

    return changedRecord;
  }

  function claimRecord(recordId) {
    const user = getCurrentUser();
    const record = records.find((item) => item.id === recordId);
    const availableStatuses = ["Yeni Bildirim", "Dağıtıcı Bekleniyor"];

    if (!record || !availableStatuses.includes(record.status)) {
      showToast("Bu kayıt şu anda üstlenilemez.");
      return;
    }

    if (state.role === "distributor" && record.distributorId) {
      showToast("Bu bildirime başka bir dağıtıcı atanmış.");
      return;
    }

    if (state.role === "receiver" && record.receiverId) {
      showToast("Bu kayıt teslim ekibine atanmış.");
      return;
    }

    updateRecord(
      recordId,
      (draft) => {
        if (state.role === "distributor") {
          draft.distributorId = user.id;
          draft.distributorName = user.name;
        } else {
          draft.receiverId = user.id;
          draft.receiverName = user.name;
        }
        draft.status = "Dağıtıcı Atandı";
      },
      `${record.recordNo} kabul edildi.`
    );
  }

  function changeStatus(recordId, status) {
    const record = records.find((item) => item.id === recordId);
    const allowed = record ? getAllowedStatuses(record) : [];

    if (!record || !allowed.includes(status)) {
      showToast("Bu durum değişikliği için yetkiniz yok.");
      renderTableOnly();
      return;
    }

    updateRecord(
      recordId,
      (draft) => {
        draft.status = status;
      },
      `${record.recordNo} durumu güncellendi.`
    );
  }

  function deleteRecord(recordId) {
    const record = records.find((item) => item.id === recordId);

    if (!record || state.role !== "admin") {
      return;
    }

    records = records.filter((item) => item.id !== recordId);
    state.drawerId = "";
    state.selected.delete(recordId);
    saveRecords();
    closeDrawer();
    renderTableOnly();
    showToast(`${record.recordNo} silindi.`);
  }

  function deleteSelectedRecords() {
    if (state.role !== "admin") {
      showToast("Toplu silme için admin girişi gerekir.");
      return;
    }

    const ids = Array.from(state.selected);

    if (!ids.length) {
      showToast("Silmek için en az bir sipariş seçin.");
      return;
    }

    records = records.filter((record) => !state.selected.has(record.id));
    state.selected.clear();
    state.drawerId = "";
    saveRecords();
    closeDrawer();
    renderTableOnly();
    showToast(`${ids.length} sipariş silindi.`);
  }

  function updateAdminRecord(form) {
    const recordId = form.dataset.recordId;
    const formData = new FormData(form);
    const receiverId = String(formData.get("receiverId") || "");
    const distributorId = String(formData.get("distributorId") || "");
    const record = records.find((item) => item.id === recordId);

    if (!record || state.role !== "admin") {
      return;
    }

    updateRecord(
      recordId,
      (draft) => {
        draft.documentNo = String(formData.get("documentNo") || "").trim();
        draft.processNo = String(formData.get("processNo") || "").trim();
        draft.orderStatus = String(formData.get("orderStatus") || getOrderStatus(record));
        draft.helpType = String(formData.get("helpType") || "").trim();
        draft.amount = String(formData.get("amount") || "").trim();
        draft.pickupDate = String(formData.get("pickupDate") || "");
        draft.pickupTime = String(formData.get("pickupTime") || "");
        draft.availableUntil = String(formData.get("availableUntil") || "");
        draft.address = String(formData.get("address") || "").trim();
        draft.description = String(formData.get("description") || "").trim();
        draft.privateNote = String(formData.get("privateNote") || "").trim();
        draft.status = String(formData.get("status") || draft.status);
        draft.receiverId = receiverId;
        draft.receiverName = getUserName(receiverId);
        draft.distributorId = distributorId;
        draft.distributorName = getUserName(distributorId);
        if (distributorId && ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(draft.status)) {
          draft.status = "Dağıtıcı Atandı";
        }
        draft.distributionRegion = String(formData.get("distributionRegion") || "").trim();
        draft.distributionNote = String(formData.get("distributionNote") || "").trim();
      },
      `${record.recordNo} güncellendi.`
    );
  }

  function handleNotificationAction(button) {
    const action = button.dataset.notificationAction;

    if (action === "read-all") {
      markNotificationsRead();
      state.notificationsOpen = false;
      state.notificationReminderDue = 0;
      window.clearTimeout(notificationReminderTimer);
      renderOrderToolbar();
      showToast("Bildirimler okundu.");
      return;
    }

    if (action === "remind-later") {
      state.notificationsOpen = false;
      state.notificationReminderDue = Date.now() + 30000;
      renderOrderToolbar();
      showToast("30 saniye sonra tekrar hatırlatılacak.");
      return;
    }

    if (action === "detail") {
      markNotificationRead(button.dataset.noteId);
      state.notificationsOpen = false;
      state.notificationReminderDue = 0;
      renderOrderToolbar();

      if (button.dataset.id) {
        openDrawer(button.dataset.id);
      }
    }
  }

  function handleOrderAction(action) {
    if (action === "add") {
      if (state.role !== "provider" && !isAdminSession()) {
        showToast("Yeni sipariş eklemek için yurt veya yardım veren kurum hesabı gerekir.");
        return;
      }

      if (state.role !== "provider") {
        state.role = "provider";
        state.userId = isAdminSession() ? getUsersByRole("provider")[0].id : getLoggedInUser().id;
        state.page = 1;
        renderAll();
      }

      window.setTimeout(() => {
        document.querySelector("#aidForm input[name='helpType']")?.focus();
      }, 0);
      showToast("Yeni sipariş formu açıldı.");
      return;
    }

    if (action === "delete") {
      deleteSelectedRecords();
      return;
    }

    if (action === "save") {
      saveRecords();
      showToast("Siparişler yerel olarak kaydedildi.");
      return;
    }

    if (action === "share") {
      const summary = `${roleMeta[state.role].label}: ${getFilteredSortedRecords().length} sipariş listeleniyor.`;

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(summary).then(
          () => showToast("Sipariş özeti panoya kopyalandı."),
          () => showToast(summary)
        );
      } else {
        showToast(summary);
      }
      return;
    }

    if (action === "filter") {
      state.filtersVisible = !state.filtersVisible;
      renderOrderToolbar();
      return;
    }

    if (action === "notifications") {
      state.notificationsOpen = !state.notificationsOpen;
      renderOrderToolbar();
      return;
    }

    if (action === "apply-filter") {
      state.page = 1;
      renderTableHead();
      renderTableBody();
      showToast("Filtre uygulandı.");
      return;
    }

    if (action === "print") {
      window.print();
      return;
    }

    if (action === "view") {
      showToast("Görünüm ayarları bu demo tabloda aktif.");
    }
  }

  function getVisibleRecordById(recordId) {
    return getVisibleRecords().find((record) => record.id === recordId);
  }

  function openDrawer(recordId) {
    const record = getVisibleRecordById(recordId);

    if (!record) {
      showToast("Bu kaydı görüntüleme yetkiniz yok.");
      return;
    }

    state.drawerId = recordId;
    els.drawerBackdrop.hidden = false;
    els.drawer.setAttribute("aria-hidden", "false");
    els.drawer.classList.add("is-open");
    els.drawerBackdrop.classList.add("is-open");
    renderDrawer();
  }

  function closeDrawer() {
    state.drawerId = "";
    els.drawer.setAttribute("aria-hidden", "true");
    els.drawer.classList.remove("is-open");
    els.drawerBackdrop.classList.remove("is-open");
    window.setTimeout(() => {
      if (!els.drawer.classList.contains("is-open")) {
        els.drawerBackdrop.hidden = true;
      }
    }, 180);
  }

  function getProgressIndex(status) {
    if (status === "İptal Edildi") {
      return -1;
    }

    return progressSteps.indexOf(status);
  }

  function renderTimeline(record) {
    const current = getProgressIndex(record.status);

    return `
      <div class="sofra-progress-wrap">
        <div class="sofra-drawer-section-title">Süreç Akışı</div>
        <ol class="sofra-progress">
          ${progressSteps
            .map((step, index) => {
              const stateClass = current >= index ? "is-done" : "";
              const currentClass = current === index ? "is-current" : "";
              return `
                <li class="${stateClass} ${currentClass}">
                  <span></span>
                  <strong>${escapeHtml(step)}</strong>
                </li>
              `;
            })
            .join("")}
        </ol>
        ${record.status === "İptal Edildi" ? `<p class="sofra-cancel-note">Bu kayıt iptal edildi.</p>` : ""}
      </div>
    `;
  }

  function renderDetailGrid(record) {
    const allFields = {
      provider: [
        ["Tarih", formatDate(record.pickupDate)],
        ["Hazır olma saati", record.pickupTime],
        ["Son alınabilirlik", record.availableUntil || "-"],
        ["Yemek türü", record.helpType],
        ["Porsiyon / miktar", record.amount],
        ["Adres", record.address],
        ["Açıklama", record.description],
        ["Durum", record.status],
        ["Teslim alacak ekip", record.receiverName || "Atanmadı"],
        ["Dağıtım durumu", getDistributionState(record)],
      ],
      receiver: [
        ["Kurum adı", record.institutionName],
        ["Yemek türü", record.helpType],
        ["Miktar / porsiyon", record.amount],
        ["Oluşturulma tarihi", formatDateTime(record.createdAt)],
        ["Hazır olma saati", record.pickupTime],
        ["Son alınabilirlik", record.availableUntil || "-"],
        ["Adres", record.address],
        ["Açıklama", record.description],
        ["Özel not", record.privateNote || "-"],
        ["Durum", record.status],
      ],
      distributor: [
        ["Tarih", formatDate(record.pickupDate)],
        ["Hazır olma saati", record.pickupTime],
        ["Son alınabilirlik", record.availableUntil || "-"],
        ["Yemek türü", record.helpType],
        ["Miktar", record.amount],
        ["Teslim alınan kurum", record.institutionName],
        ["Teslim alınacak konum", record.address],
        ["Dağıtım bölgesi / notu", `${record.distributionRegion || "-"} / ${record.distributionNote || "-"}`],
        ["Durum", record.status],
      ],
      admin: [
        ["Belge no", getOrderDocumentNo(record)],
        ["Süreç no", getOrderProcessNo(record)],
        ["Firma adı", record.institutionName],
        ["Onay durumu", getOrderStatus(record)],
        ["Yemek türü", record.helpType],
        ["Miktar", record.amount],
        ["Tarih / hazır saati", `${formatDate(record.pickupDate)} ${record.pickupTime}`],
        ["Son alınabilirlik", record.availableUntil || "-"],
        ["Adres", record.address],
        ["Açıklama", record.description],
        ["Özel not", record.privateNote || "-"],
        ["Teslim alacak ekip", record.receiverName || "Atanmadı"],
        ["Dağıtan kişi", record.distributorName || "Atanmadı"],
        ["Dağıtım bölgesi", record.distributionRegion || "-"],
        ["Durum", record.status],
        ["Son güncelleme", formatDateTime(record.updatedAt)],
        ["Fotoğraf", record.photoName || "Eklenmedi"],
      ],
    };

    return `
      <div class="sofra-detail-grid">
        ${allFields[state.role]
          .map(
            ([label, value]) => `
              <div>
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderHistory(record) {
    return `
      <div class="sofra-history">
        <div class="sofra-drawer-section-title">Hareketler</div>
        ${(record.history || [])
          .slice()
          .reverse()
          .map(
            (item) => `
              <div>
                ${renderStatusBadge(item.status)}
                <span>${escapeHtml(item.actor)} - ${escapeHtml(formatDateTime(item.at))}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderStatusAction(record) {
    const allowed = getAllowedStatuses(record);

    if (!allowed.length) {
      return "";
    }

    return `
      <label class="sofra-drawer-status">
        <span>Durum değiştir</span>
        <select data-status-drawer="${escapeHtml(record.id)}">
          ${allowed
            .map(
              (status) =>
                `<option value="${escapeHtml(status)}" ${status === record.status ? "selected" : ""}>${escapeHtml(status)}</option>`
            )
            .join("")}
        </select>
      </label>
    `;
  }

  function renderDrawerActions(record) {
    const canClaim =
      ((state.role === "receiver" && !record.receiverId) || (state.role === "distributor" && !record.distributorId)) &&
      ["Yeni Bildirim", "Dağıtıcı Bekleniyor"].includes(record.status);
    const canCancel = state.role === "provider" && record.institutionId === getCurrentUser().id && !["Tamamlandı", "İptal Edildi"].includes(record.status);

    if (state.role === "admin") {
      const receiverOptions = getUsersByRole("receiver")
        .map(
          (user) =>
            `<option value="${escapeHtml(user.id)}" ${user.id === record.receiverId ? "selected" : ""}>${escapeHtml(user.name)}</option>`
        )
        .join("");
      const distributorOptions = getUsersByRole("distributor")
        .map(
          (user) =>
            `<option value="${escapeHtml(user.id)}" ${user.id === record.distributorId ? "selected" : ""}>${escapeHtml(user.name)}</option>`
        )
        .join("");

      return `
        <form class="sofra-admin-edit" data-record-id="${escapeHtml(record.id)}" id="adminEditForm">
          <div class="sofra-drawer-section-title">Admin düzenleme</div>
          <div class="sofra-form-grid">
            <label><span>Belge no</span><input name="documentNo" value="${escapeHtml(getOrderDocumentNo(record))}" required></label>
            <label><span>Süreç no</span><input name="processNo" value="${escapeHtml(getOrderProcessNo(record))}" required></label>
          </div>
          <div class="sofra-form-grid">
            <label><span>Yardım türü</span><input name="helpType" value="${escapeHtml(record.helpType)}" required></label>
            <label><span>Miktar</span><input name="amount" value="${escapeHtml(record.amount)}" required></label>
          </div>
          <div class="sofra-form-grid">
            <label>
              <span>Onay durumu</span>
              <select name="orderStatus">
                ${["Onaysız", "Onaylı", "Hazır", "İptal"].map((status) => `<option value="${escapeHtml(status)}" ${status === getOrderStatus(record) ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="sofra-form-grid">
            <label><span>Tarih</span><input name="pickupDate" type="date" value="${escapeHtml(record.pickupDate)}" required></label>
            <label><span>Hazır saati</span><input name="pickupTime" type="time" value="${escapeHtml(record.pickupTime)}" required></label>
          </div>
          <label><span>Son teslim / alınabilirlik saati</span><input name="availableUntil" type="time" value="${escapeHtml(record.availableUntil || "")}"></label>
          <label><span>Adres</span><textarea name="address" rows="2">${escapeHtml(record.address)}</textarea></label>
          <label><span>Açıklama</span><textarea name="description" rows="2">${escapeHtml(record.description)}</textarea></label>
          <label><span>Özel not</span><textarea name="privateNote" rows="2">${escapeHtml(record.privateNote)}</textarea></label>
          <div class="sofra-form-grid">
            <label>
              <span>Durum</span>
              <select name="status">
                ${statuses.map((status) => `<option value="${escapeHtml(status)}" ${status === record.status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}
              </select>
            </label>
            <label>
              <span>Teslim alacak ekip</span>
              <select name="receiverId">
                <option value="">Atanmadı</option>
                ${receiverOptions}
              </select>
            </label>
          </div>
          <div class="sofra-form-grid">
            <label>
              <span>Dağıtan kişi</span>
              <select name="distributorId">
                <option value="">Atanmadı</option>
                ${distributorOptions}
              </select>
            </label>
            <label><span>Dağıtım bölgesi</span><input name="distributionRegion" value="${escapeHtml(record.distributionRegion)}"></label>
          </div>
          <label><span>Dağıtım notu</span><textarea name="distributionNote" rows="2">${escapeHtml(record.distributionNote)}</textarea></label>
          <div class="sofra-admin-actions">
            <button class="sofra-btn sofra-btn-primary" type="submit">Güncelle</button>
            <button class="sofra-btn sofra-btn-danger" type="button" data-drawer-action="status" data-status="İptal Edildi" data-id="${escapeHtml(record.id)}">İptal Et</button>
            <button class="sofra-btn sofra-btn-danger" type="button" data-drawer-action="delete" data-id="${escapeHtml(record.id)}">Sil</button>
          </div>
        </form>
      `;
    }

    return `
      <div class="sofra-drawer-actions">
        ${canClaim ? `<button class="sofra-btn sofra-btn-primary" type="button" data-drawer-action="claim" data-id="${escapeHtml(record.id)}">Bildirimi Kabul Et</button>` : ""}
        ${state.role === "distributor" && record.distributorId === getCurrentUser().id && record.status === "Dağıtıcı Atandı" ? `<button class="sofra-btn sofra-btn-primary" type="button" data-drawer-action="status" data-status="Teslim Alındı" data-id="${escapeHtml(record.id)}">Teslim Alındı</button>` : ""}
        ${state.role === "distributor" && record.distributorId === getCurrentUser().id && record.status === "Teslim Alındı" ? `<button class="sofra-btn sofra-btn-primary" type="button" data-drawer-action="status" data-status="Vakıfa Teslim Edildi" data-id="${escapeHtml(record.id)}">Vakıfa Teslim Edildi</button>` : ""}
        ${state.role === "distributor" && record.distributorId === getCurrentUser().id && ["Teslim Alındı", "Vakıfa Teslim Edildi"].includes(record.status) ? `<button class="sofra-btn sofra-btn-ghost" type="button" data-drawer-action="status" data-status="Tamamlandı" data-id="${escapeHtml(record.id)}">Tamamlandı</button>` : ""}
        ${canCancel ? `<button class="sofra-btn sofra-btn-danger" type="button" data-drawer-action="status" data-status="İptal Edildi" data-id="${escapeHtml(record.id)}">İptal Et</button>` : ""}
        ${renderStatusAction(record)}
      </div>
    `;
  }

  function renderDrawer() {
    const record = getVisibleRecordById(state.drawerId);

    if (!record) {
      closeDrawer();
      return;
    }

    els.drawerContent.innerHTML = `
      <div class="sofra-drawer-head">
        <div>
          <span class="sofra-kicker">${escapeHtml(record.recordNo)}</span>
          <h2>${escapeHtml(record.institutionName)}</h2>
          ${renderStatusBadge(record.status)}
        </div>
        <button class="sofra-drawer-close" type="button" data-drawer-close aria-label="Detay panelini kapat">×</button>
      </div>

      ${renderTimeline(record)}
      ${renderDetailGrid(record)}
      ${renderDrawerActions(record)}
      ${renderHistory(record)}
    `;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2400);
  }

  function handleSort(key) {
    if (state.sort.key === key) {
      state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
    } else {
      state.sort = { key, dir: "asc" };
    }

    renderTableHead();
    renderTableBody();
  }

  function bindEvents() {
    els.sidebarToggle?.addEventListener("click", () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      saveSidebarState();
      renderAuthState();
    });

    app.addEventListener("click", (event) => {
      const notificationButton = event.target.closest("[data-notification-action]");

      if (notificationButton) {
        handleNotificationAction(notificationButton);
        return;
      }

      const actionButton = event.target.closest("[data-order-action]");

      if (!actionButton) {
        return;
      }

      handleOrderAction(actionButton.dataset.orderAction);
    });

    app.addEventListener("input", (event) => {
      const searchInput = event.target.closest("[data-order-search]");

      if (!searchInput) {
        return;
      }

      state.search = searchInput.value;
      state.page = 1;
      els.tableSearch.value = state.search;
      renderTableBody();
      renderTableHead();
    });

    app.addEventListener("change", (event) => {
      const dateInput = event.target.closest("[data-order-date]");

      if (!dateInput) {
        return;
      }

      state[dateInput.dataset.orderDate] = dateInput.value;
      state.page = 1;
      renderTableBody();
      renderTableHead();
    });

    els.roleTabs.forEach((button) => {
      button.addEventListener("click", () => {
        if (!canOpenRole(button.dataset.role)) {
          showToast("Bu ekran için giriş yetkiniz yok.");
          return;
        }

        state.role = button.dataset.role;
        state.userId = isAdminSession() ? getUsersByRole(state.role)[0].id : getLoggedInUser().id;
        state.page = 1;
        state.search = "";
        state.filters = {};
        state.sort = { key: "pickupDate", dir: "desc" };
        els.tableSearch.value = "";
        renderAll();
      });
    });

    els.userSelect.addEventListener("change", (event) => {
      if (!isAdminSession()) {
        renderRoleControls();
        showToast("Kullanıcı değiştirmek için admin girişi gerekir.");
        return;
      }

      state.userId = event.target.value;
      state.page = 1;
      state.filters = {};
      state.selected.clear();
      renderAll();
    });

    els.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const selectedUser = findLoginUser(els.accountEmail?.value || els.accountLoginSelect?.value);
      const password = els.accountPassword.value.trim();

      if (!selectedUser || selectedUser.password !== password) {
        showToast("E-posta veya şifre hatalı. Demo: admin@gonul.local / 1234");
        els.accountPassword.focus();
        return;
      }

      state.isAuthenticated = true;
      state.loggedInUserId = selectedUser.id;
      state.role = selectedUser.role;
      state.userId = selectedUser.id;
      state.page = 1;
      state.search = "";
      state.filters = {};
      state.selected.clear();
      state.drawerId = "";
      state.notificationReminderDue = 0;
      els.tableSearch.value = "";
      els.accountPassword.value = "";
      saveSessionUser(selectedUser.id);
      closeDrawer();
      renderAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast(`${selectedUser.name} hesabına giriş yapıldı.`);
    });

    els.accountLoginSelect?.addEventListener("change", renderLoginPanel);

    els.loginAccountList?.addEventListener("click", (event) => {
      const accountButton = event.target.closest("[data-login-user]");

      if (!accountButton) {
        return;
      }

      els.accountLoginSelect.value = accountButton.dataset.loginUser;
      if (els.accountEmail) {
        const selectedUser = users.find((user) => user.id === accountButton.dataset.loginUser);
        els.accountEmail.value = selectedUser ? getLoginEmail(selectedUser) : "";
      }
      els.accountPassword.focus();
      renderLoginPanel();
    });

    els.logoutButton.addEventListener("click", () => {
      const admin = users.find((user) => user.id === "admin-merkez");
      state.isAuthenticated = false;
      state.loggedInUserId = admin.id;
      state.role = admin.role;
      state.userId = admin.id;
      state.page = 1;
      state.search = "";
      state.filters = {};
      state.selected.clear();
      state.drawerId = "";
      state.notificationReminderDue = 0;
      els.tableSearch.value = "";
      if (els.accountEmail) {
        els.accountEmail.value = "";
      }
      if (els.accountPassword) {
        els.accountPassword.value = "";
      }
      clearSessionUser();
      closeDrawer();
      renderAll();
      showToast("Oturum kapatıldı.");
    });

    els.screenCards.addEventListener("click", (event) => {
      const card = event.target.closest("[data-screen-role]");

      if (!card) {
        return;
      }

      if (!canOpenRole(card.dataset.screenRole)) {
        showToast("Bu ekran için giriş yetkiniz yok.");
        return;
      }

      state.role = card.dataset.screenRole;
      state.userId = isAdminSession() ? getUsersByRole(state.role)[0].id : getLoggedInUser().id;
      state.page = 1;
      state.search = "";
      state.filters = {};
      state.selected.clear();
      state.sort = { key: "pickupDate", dir: "desc" };
      els.tableSearch.value = "";
      renderAll();
    });

    els.tableSearch.addEventListener("input", (event) => {
      state.search = event.target.value;
      state.page = 1;
      renderTableBody();
      renderTableHead();
    });

    els.pageSize.addEventListener("change", (event) => {
      state.pageSize = Number(event.target.value);
      state.page = 1;
      renderTableBody();
      renderTableHead();
    });

    els.resetData.addEventListener("click", () => {
      records = normalizeRecords(cloneRecords(seedRecords));
      notifications = [];
      state.drawerId = "";
      state.selected.clear();
      saveRecords();
      saveNotifications();
      closeDrawer();
      renderAll();
      showToast("Örnek veri yenilendi.");
    });

    els.tableHead.addEventListener("click", (event) => {
      const sortButton = event.target.closest("[data-sort]");
      const checkAll = event.target.closest("[data-check-all]");

      if (sortButton) {
        handleSort(sortButton.dataset.sort);
        return;
      }

      if (checkAll) {
        const visibleIds = getFilteredSortedRecords().map((record) => record.id);
        const shouldSelect = checkAll.checked;
        visibleIds.forEach((id) => {
          if (shouldSelect) {
            state.selected.add(id);
          } else {
            state.selected.delete(id);
          }
        });
        renderTableBody();
        renderTableHead();
        renderOrderToolbar();
      }
    });

    els.tableHead.addEventListener("input", (event) => {
      const input = event.target.closest("[data-filter]");

      if (!input) {
        return;
      }

      state.filters[input.dataset.filter] = input.value;
      state.page = 1;
      renderTableBody();
    });

    els.tableHead.addEventListener("change", (event) => {
      const input = event.target.closest("[data-filter]");

      if (!input) {
        return;
      }

      state.filters[input.dataset.filter] = input.value;
      state.page = 1;
      renderTableBody();
      renderTableHead();
    });

    els.tableBody.addEventListener("click", (event) => {
      const checkbox = event.target.closest("[data-check-id]");
      const action = event.target.closest("[data-action]");
      const interactive = event.target.closest("select, button, input, label");

      if (checkbox) {
        const id = checkbox.dataset.checkId;
        if (checkbox.checked) {
          state.selected.add(id);
        } else {
          state.selected.delete(id);
        }
        renderTableBody();
        renderTableHead();
        renderOrderToolbar();
        return;
      }

      if (action) {
        const id = action.dataset.id;

        if (action.dataset.action === "claim") {
          claimRecord(id);
        } else {
          openDrawer(id);
        }
        return;
      }

      if (interactive) {
        return;
      }

      const row = event.target.closest("[data-record-id]");

      if (row) {
        openDrawer(row.dataset.recordId);
      }
    });

    els.tableBody.addEventListener("change", (event) => {
      const statusSelect = event.target.closest("[data-status-inline]");

      if (statusSelect) {
        changeStatus(statusSelect.dataset.statusInline, statusSelect.value);
      }
    });

    els.paginationBar.addEventListener("click", (event) => {
      const pageButton = event.target.closest("[data-page]");

      if (!pageButton) {
        return;
      }

      if (pageButton.dataset.page === "prev") {
        state.page = Math.max(1, state.page - 1);
      } else {
        const totalPages = Math.max(1, Math.ceil(getFilteredSortedRecords().length / state.pageSize));
        state.page = Math.min(totalPages, state.page + 1);
      }

      renderTableBody();
      renderTableHead();
    });

    els.contextPanel.addEventListener("submit", (event) => {
      if (event.target.matches("#aidForm")) {
        event.preventDefault();
        createRecord(event.target);
      }
    });

    els.contextPanel.addEventListener("click", (event) => {
      const action = event.target.closest("[data-panel-action]");

      if (!action) {
        return;
      }

      if (action.dataset.panelAction === "claim-selected") {
        const [id] = Array.from(state.selected);

        if (!id || state.selected.size !== 1) {
          showToast("Üstlenmek için tek bir uygun kayıt seçin.");
          return;
        }

        claimRecord(id);
      }
    });

    els.drawer.addEventListener("click", (event) => {
      if (event.target.closest("[data-drawer-close]")) {
        closeDrawer();
        return;
      }

      const action = event.target.closest("[data-drawer-action]");

      if (!action) {
        return;
      }

      if (action.dataset.drawerAction === "claim") {
        claimRecord(action.dataset.id);
      }

      if (action.dataset.drawerAction === "delete") {
        deleteRecord(action.dataset.id);
      }

      if (action.dataset.drawerAction === "status") {
        changeStatus(action.dataset.id, action.dataset.status);
      }
    });

    els.drawer.addEventListener("change", (event) => {
      const statusSelect = event.target.closest("[data-status-drawer]");

      if (statusSelect) {
        changeStatus(statusSelect.dataset.statusDrawer, statusSelect.value);
      }
    });

    els.drawer.addEventListener("submit", (event) => {
      if (event.target.matches("#adminEditForm")) {
        event.preventDefault();
        updateAdminRecord(event.target);
      }
    });

    els.drawerBackdrop.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });
  }

  bindEvents();
  renderAll();
})();

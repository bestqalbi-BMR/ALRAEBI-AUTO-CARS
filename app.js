/* =========================================================
   ALRAEBI AUTO CARS
   APP.JS V20 — CLEAN UNIFIED ENGINE
   Arabic RTL / Mobile / Acode
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. BASIC HELPERS
     ========================================================= */

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const safeJSON = (value, fallback) => {
    try {
      const parsed = JSON.parse(value);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const get = (key, fallback = []) => {
    return safeJSON(localStorage.getItem(key), fallback);
  };

  const set = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const remove = (key) => {
    localStorage.removeItem(key);
  };

  const now = () => new Date().toISOString();

  const uid = (prefix = "ID") =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const escapeHTML = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  /* =========================================================
     2. STORE KEYS
     ========================================================= */

  const KEYS = {
    cars: "alraebi_cars_v20",
    fav: "alraebi_favorites_v20",
    compare: "alraebi_compare_v20",
    requests: "alraebi_requests_v20",
    customers: "alraebi_customers_v20",
    orders: "alraebi_orders_v20",
    leads: "alraebi_leads_v20",
    settings: "alraebi_settings_v20",
    customerSession: "alraebi_customer_session_v20",
    adminSession: "alraebi_admin_session_v20"
  };

  /*
     Keep compatibility with the older site.
     This prevents losing existing cars when moving to V20.
  */

  const OLD_KEYS = {
    cars: [
      "alraebi_cars_v10",
      "alraebi_v12_cars",
      "alraebi_cars",
      "alraebi_v13_db"
    ],
    fav: [
      "alraebi_favorites_v10",
      "alraebi_fav_v10"
    ],
    compare: [
      "alraebi_compare_v10"
    ],
    requests: [
      "alraebi_requests_v10"
    ],
    customers: [
      "alraebi_v12_customers"
    ],
    orders: [
      "alraebi_v12_orders",
      "alraebi_orders_v10"
    ],
    leads: [
      "alraebi_leads_v11"
    ]
  };

  /* =========================================================
     3. DEFAULT CATALOG
     ========================================================= */

  const FALLBACK_CARS = [
    {
      id: "v20-rd6",
      name: "RIDDARA RD6",
      brand: "RIDDARA",
      year: 2026,
      type: "بيك أب",
      fuel: "كهربائية",
      drive: "4×4",
      price: 0,
      stock: "متوفر الآن",
      tag: "NEW",
      img: "images/car-1.jpg",
      description:
        "بيك أب كهربائية بتصميم عصري وأداء قوي للاستخدام اليومي والرحلات.",
      features: [
        "دفع رباعي",
        "محرك كهربائي",
        "شاشة ذكية",
        "أنظمة أمان متقدمة"
      ]
    },
    {
      id: "v20-suv",
      name: "SUV PREMIUM",
      brand: "RIDDARA",
      year: 2026,
      type: "SUV",
      fuel: "كهربائية",
      drive: "4×4",
      price: 0,
      stock: "متوفر الآن",
      tag: "PREMIUM",
      img: "images/car-2.jpg",
      description:
        "سيارة SUV فاخرة تجمع بين الراحة والتقنية والأداء.",
      features: [
        "دفع رباعي",
        "مقصورة فاخرة",
        "شاشة كبيرة",
        "كاميرات محيطية"
      ]
    }
  ];

  /* =========================================================
     4. MIGRATION ENGINE
     ========================================================= */

  function findOldValue(keys, fallback) {
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        const parsed = safeJSON(value, null);
        if (parsed !== null) return parsed;
      }
    }
    return fallback;
  }

  function normalizeCar(car, index = 0) {
    const image =
      car.img ||
      car.image ||
      (Array.isArray(car.images) ? car.images[0] : "") ||
      "images/car-1.jpg";

    return {
      id: String(car.id || `CAR-${Date.now()}-${index}`),
      name: car.name || "سيارة بدون اسم",
      brand: car.brand || car.company || "ALRAEBI",
      year: Number(car.year || 2026),
      type: car.type || "سيارة",
      fuel: car.fuel || "بنزين",
      drive: car.drive || "2WD",
      price: Number(car.price || 0),
      stock: car.stock ?? car.status ?? "متوفر",
      status: car.status || "متوفر",
      tag: car.tag || "متوفر",
      img: image,
      image,
      images:
        Array.isArray(car.images) && car.images.length
          ? car.images
          : [image],
      description: car.description || car.desc || "",
      desc: car.desc || car.description || "",
      features: Array.isArray(car.features)
        ? car.features
        : []
    };
  }

  function migrateData() {
    let currentCars = get(KEYS.cars, null);

    if (!Array.isArray(currentCars) || !currentCars.length) {
      const oldDB = findOldValue(OLD_KEYS.cars, null);

      if (
        oldDB &&
        !Array.isArray(oldDB) &&
        Array.isArray(oldDB.cars)
      ) {
        currentCars = oldDB.cars;
      } else {
        currentCars = oldDB;
      }

      if (!Array.isArray(currentCars) || !currentCars.length) {
        currentCars = FALLBACK_CARS;
      }

      currentCars = currentCars.map(normalizeCar);
      set(KEYS.cars, currentCars);
    }

    const oldFav = findOldValue(OLD_KEYS.fav, []);
    if (!localStorage.getItem(KEYS.fav)) {
      set(
        KEYS.fav,
        Array.isArray(oldFav) ? oldFav : []
      );
    }

    const oldCompare = findOldValue(OLD_KEYS.compare, []);
    if (!localStorage.getItem(KEYS.compare)) {
      set(
        KEYS.compare,
        Array.isArray(oldCompare) ? oldCompare : []
      );
    }

    const oldRequests = findOldValue(OLD_KEYS.requests, []);
    if (!localStorage.getItem(KEYS.requests)) {
      set(
        KEYS.requests,
        Array.isArray(oldRequests) ? oldRequests : []
      );
    }

    const oldCustomers = findOldValue(
      OLD_KEYS.customers,
      []
    );

    if (!localStorage.getItem(KEYS.customers)) {
      if (
        oldCustomers &&
        !Array.isArray(oldCustomers) &&
        Array.isArray(oldCustomers.customers)
      ) {
        set(KEYS.customers, oldCustomers.customers);
      } else {
        set(
          KEYS.customers,
          Array.isArray(oldCustomers) ? oldCustomers : []
        );
      }
    }

    const oldOrders = findOldValue(OLD_KEYS.orders, []);

    if (!localStorage.getItem(KEYS.orders)) {
      if (
        oldOrders &&
        !Array.isArray(oldOrders) &&
        Array.isArray(oldOrders.orders)
      ) {
        set(KEYS.orders, oldOrders.orders);
      } else {
        set(
          KEYS.orders,
          Array.isArray(oldOrders) ? oldOrders : []
        );
      }
    }

    const oldLeads = findOldValue(OLD_KEYS.leads, []);

    if (!localStorage.getItem(KEYS.leads)) {
      set(
        KEYS.leads,
        Array.isArray(oldLeads) ? oldLeads : []
      );
    }
  }

  migrateData();

  /* =========================================================
     5. LIVE DATA
     ========================================================= */

  let cars = get(KEYS.cars, FALLBACK_CARS).map(normalizeCar);

  let fav = new Set(
    get(KEYS.fav, [])
      .map(String)
  );

  let compare = get(KEYS.compare, [])
    .map(String)
    .slice(0, 3);

  let requests = get(KEYS.requests, []);

  /* =========================================================
     6. SAVE STATE
     ========================================================= */

  function saveCars() {
    set(KEYS.cars, cars);
  }

  function saveFav() {
    set(KEYS.fav, [...fav]);
  }

  function saveCompare() {
    set(KEYS.compare, compare);
  }

  function saveRequests() {
    set(KEYS.requests, requests);
  }

  /* =========================================================
     7. TOAST
     ========================================================= */

  function toast(message) {
    let element = $("#toast");

    if (!element) {
      element = document.createElement("div");
      element.id = "toast";
      element.className = "toast";
      document.body.appendChild(element);
    }

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(element._timer);

    element._timer = setTimeout(() => {
      element.classList.remove("show");
    }, 2200);
  }

  window.toast = toast;

  /* =========================================================
     8. WHATSAPP — FIXED V20
     ========================================================= */

  const WA_NUMBER = "967716153268";

  window.WA_NUMBER = WA_NUMBER;

  function wa(message = "") {
    const text = message ||
      "مرحباً الراعبي أوتو كارز، أريد الاستفسار عن السيارات المتوفرة والأسعار.";

    const encoded = encodeURIComponent(text);

    const appURL =
      `whatsapp://send?phone=${WA_NUMBER}&text=${encoded}`;

    const webURL =
      `https://wa.me/${WA_NUMBER}?text=${encoded}`;

    /*
      First try the WhatsApp application.
      Then fallback to wa.me.
    */

    let fallbackTriggered = false;

    const fallback = () => {
      if (fallbackTriggered) return;

      fallbackTriggered = true;

      window.location.href = webURL;
    };

    try {
      window.location.href = appURL;

      setTimeout(fallback, 1600);
    } catch (error) {
      fallback();
    }
  }

  window.wa = wa;

  /* =========================================================
     9. PRICE
     ========================================================= */

  function money(value) {
    const number = Number(value || 0);

    if (!number) {
      return "اتصل للسعر";
    }

    return (
      number.toLocaleString("en-US") +
      " $"
    );
  }

  window.money = money;

  /* =========================================================
     10. CAR CARD
     ========================================================= */

  function card(car) {
    const id = escapeHTML(car.id);

    const isFav = fav.has(String(car.id));
    const isCompare = compare.includes(String(car.id));

    return `
      <article
        class="card car-card-v10 v20-car-card"
        data-car-search="${escapeHTML(
          `${car.name} ${car.brand} ${car.type} ${car.fuel} ${car.drive}`
        )}"
      >

        <div class="cardshine"></div>

        <div class="carimg">

          <img
            src="${escapeHTML(car.img)}"
            alt="${escapeHTML(car.name)}"
            loading="lazy"
            onerror="this.src='images/car-1.jpg'"
          >

          <span class="tag">
            ${escapeHTML(car.tag || "متوفر")}
          </span>

          <span class="ribbon">
            ${escapeHTML(car.stock || "متوفر الآن")}
          </span>

          <button
            class="fav ${isFav ? "on" : ""}"
            onclick="toggleFav('${id}')"
            aria-label="المفضلة"
          >
            ${isFav ? "♥" : "♡"}
          </button>

        </div>

        <div class="cardbody">

          <h3>${escapeHTML(car.name)}</h3>

          <div class="muted">
            ${escapeHTML(car.brand)} •
            ${escapeHTML(car.year)}
          </div>

          <div class="meta">

            <span>
              ⚡ ${escapeHTML(car.fuel)}
            </span>

            <span>
              ◈ ${escapeHTML(car.drive)}
            </span>

            <span>
              ▣ ${escapeHTML(car.type)}
            </span>

          </div>

          <div class="cardfoot">

            <div class="price">
              ${money(car.price)}

              <small>
                ${escapeHTML(car.stock || "متوفر")}
              </small>
            </div>

            <div>

              <button
                class="iconbtn"
                onclick="toggleCompare('${id}')"
                title="مقارنة"
              >
                ${isCompare ? "✓" : "⇄"}
              </button>

              <button
                class="btn primary"
                onclick="detail('${id}')"
              >
                عرض
              </button>

            </div>

          </div>

        </div>

      </article>
    `;
  }

  window.card = card;

  /* =========================================================
     11. RENDER CARS
     ========================================================= */

  function render() {
    const query =
      ($("#q")?.value || "")
        .toLowerCase()
        .trim();

    const brand =
      $("#brand")?.value || "";

    const type =
      $("#type")?.value || "";

    const sort =
      $("#sort")?.value || "";

    let result = cars.filter((car) => {

      const searchable = [
        car.name,
        car.brand,
        car.type,
        car.tag,
        car.fuel,
        car.drive,
        car.year
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (!brand || car.brand === brand) &&
        (!type || car.type === type)
      );
    });

    if (sort === "name") {
      result.sort((a, b) =>
        String(a.name).localeCompare(
          String(b.name),
          "ar"
        )
      );
    }

    if (sort === "year") {
      result.sort(
        (a, b) =>
          Number(b.year || 0) -
          Number(a.year || 0)
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    const container = $("#cars");

    if (container) {
      container.innerHTML = result.length
        ? result.map(card).join("")
        : `
          <div class="empty">
            لا توجد نتائج مطابقة.
          </div>
        `;
    }

    updateCounters();
    updateCompare();

    /*
      V11-compatible cards
    */

    $$(".car-card, .product-card").forEach((element) => {

      element.classList.add("v20-card");

      if (!element.hasAttribute("data-car-search")) {
        element.setAttribute(
          "data-car-search",
          element.textContent || ""
        );
      }
    });
  }

  window.render = render;

  /* =========================================================
     12. COUNTERS
     ========================================================= */

  function updateCounters() {

    if ($("#favCount")) {
      $("#favCount").textContent =
        fav.size;
    }

    if ($("#reqCount")) {
      $("#reqCount").textContent =
        requests.length;
    }

    $("[data-v11-stat='cars']") &&
      $$("[data-v11-stat='cars']").forEach(
        (element) => {
          element.textContent =
            cars.length;
        }
      );

    $$("[data-stat='cars']").forEach(
      (element) => {
        element.textContent =
          cars.length;
      }
    );

    $$("[data-stat='favorites']").forEach(
      (element) => {
        element.textContent =
          fav.size;
      }
    );

    $$("[data-stat='requests']").forEach(
      (element) => {
        element.textContent =
          requests.length;
      }
    );
  }

  /* =========================================================
     13. FAVORITES
     ========================================================= */

  function toggleFav(id) {

    id = String(id);

    if (fav.has(id)) {
      fav.delete(id);
      toast("أزيلت من المفضلة");
    } else {
      fav.add(id);
      toast("أضيفت للمفضلة");
    }

    saveFav();
    render();
  }

  window.toggleFav = toggleFav;

  /* =========================================================
     14. COMPARE
     ========================================================= */

  function toggleCompare(id) {

    id = String(id);

    if (compare.includes(id)) {

      compare =
        compare.filter(
          (item) => item !== id
        );

      toast("تمت إزالة السيارة من المقارنة");

    } else {

      if (compare.length >= 3) {
        toast("المقارنة تصل إلى 3 سيارات");
        return;
      }

      compare.push(id);

      toast("تمت إضافة السيارة للمقارنة");
    }

    saveCompare();
    render();
  }

  window.toggleCompare = toggleCompare;

  function updateCompare() {

    const bar = $("#compareBar");

    if (!bar) return;

    const selected =
      compare
        .map((id) =>
          cars.find(
            (car) =>
              String(car.id) === String(id)
          )
        )
        .filter(Boolean);

    bar.classList.toggle(
      "show",
      selected.length > 0
    );

    const mini = $("#compareMini");

    if (mini) {
      mini.innerHTML =
        selected
          .map(
            (car) =>
              `<span>${escapeHTML(car.name)}</span>`
          )
          .join("");
    }

    const count = $("#compareCount");

    if (count) {
      count.textContent =
        selected.length;
    }
  }

  function clearCompare() {

    compare = [];

    saveCompare();
    render();

    toast("تم إفراغ المقارنة");
  }

  window.clearCompare = clearCompare;

  /* =========================================================
     15. MODAL
     ========================================================= */

  function openModal(html) {

    const modal = $("#modal");

    if (!modal) return;

    modal.classList.add("show");

    const content =
      $("#modalContent");

    if (content) {
      content.innerHTML = html;
    }
  }

  function closeModal() {

    $("#modal")?.classList.remove(
      "show"
    );
  }

  window.closeModal = closeModal;

  /* =========================================================
     16. CAR DETAILS
     ========================================================= */

  function detail(id) {

    const car =
      cars.find(
        (item) =>
          String(item.id) === String(id)
      );

    if (!car) {
      toast("السيارة غير موجودة");
      return;
    }

    const images =
      Array.isArray(car.images) &&
      car.images.length
        ? car.images
        : [car.img];

    const features =
      (car.features || [])
        .map(
          (feature) =>
            `<span>✦ ${escapeHTML(feature)}</span>`
        )
        .join("");

    openModal(`

      <button
        class="close"
        onclick="closeModal()"
      >
        ×
      </button>

      <div class="gallery">

        <img
          id="mainCarImage"
          src="${escapeHTML(images[0])}"
          alt="${escapeHTML(car.name)}"
          onerror="this.src='images/car-1.jpg'"
        >

        <div class="thumbs">

          ${images
            .slice(0, 8)
            .map(
              (image) => `
                <img
                  src="${escapeHTML(image)}"
                  onclick="changeMainImage(this.src)"
                  alt=""
                  onerror="this.style.display='none'"
                >
              `
            )
            .join("")}

        </div>

      </div>

      <div class="premiumline"></div>

      <div class="detailgrid">

        <div>

          <span class="eyebrow">
            ${escapeHTML(car.tag || "ALRAEBI")}
          </span>

          <h2>
            ${escapeHTML(car.name)}
          </h2>

          <p class="muted">
            ${escapeHTML(
              car.description || ""
            )}
          </p>

          <div class="meta">

            <span>
              ${escapeHTML(car.year)}
            </span>

            <span>
              ${escapeHTML(car.drive)}
            </span>

            <span>
              ${escapeHTML(car.fuel)}
            </span>

            <span>
              ${escapeHTML(
                car.stock || "متوفر"
              )}
            </span>

          </div>

        </div>

        <div>

          <h3>
            ${money(car.price)}
          </h3>

          <div class="meta">
            ${features}
          </div>

          <div class="detailactions">

            <button
              class="btn primary"
              onclick="requestCar('${escapeHTML(car.id)}')"
            >
              اطلب الآن
            </button>

            <button
              class="btn"
              onclick="wa('استفسار عن ${escapeHTML(car.name)}')"
            >
              واتساب
            </button>

            <button
              class="btn red"
              onclick="testDrive('${escapeHTML(car.id)}')"
            >
              تجربة قيادة
            </button>

          </div>

        </div>

      </div>

    `);
  }

  window.detail = detail;

  function changeMainImage(src) {

    const image =
      $("#mainCarImage");

    if (image) {
      image.src = src;
    }
  }

  window.changeMainImage =
    changeMainImage;

  /* =========================================================
     17. REQUEST CAR
     ========================================================= */

  function requestCar(id) {

    const car =
      cars.find(
        (item) =>
          String(item.id) === String(id)
      );

    if (!car) {
      toast("السيارة غير موجودة");
      return;
    }

    const request = {
      id: uid("REQ"),
      carId: car.id,
      name: car.name,
      brand: car.brand,
      date: now(),
      status: "جديد"
    };

    requests.unshift(request);

    saveRequests();

    closeModal();

    wa(
      `طلب سيارة - ${car.name}

الماركة: ${car.brand}
السنة: ${car.year}
السعر: ${money(car.price)}

أرغب في معرفة التفاصيل.`
    );

    toast("تم تجهيز طلبك");
    updateCounters();
  }

  window.requestCar =
    requestCar;

  /* =========================================================
     18. TEST DRIVE
     ========================================================= */

  function testDrive(id) {

    const car =
      cars.find(
        (item) =>
          String(item.id) === String(id)
      );

    if (!car) return;

    openModal(`

      <button
        class="close"
        onclick="closeModal()"
      >
        ×
      </button>

      <h2>
        حجز تجربة قيادة
      </h2>

      <p class="muted">
        ${escapeHTML(car.name)}
      </p>

      <form
        onsubmit="submitDrive(event,'${escapeHTML(car.id)}')"
      >

        <div class="formgrid">

          <input
            class="field"
            id="dn"
            required
            placeholder="الاسم"
          >

          <input
            class="field"
            id="dp"
            required
            placeholder="رقم الهاتف"
          >

          <input
            class="field"
            id="dd"
            type="date"
            required
          >

          <select
            class="field"
            id="dt"
          >
            <option>10:00</option>
            <option>12:00</option>
            <option>16:00</option>
            <option>18:00</option>
          </select>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          type="submit"
        >
          إرسال الحجز
        </button>

      </form>
    `);
  }

  window.testDrive =
    testDrive;

  function submitDrive(event, id) {

    event.preventDefault();

    const car =
      cars.find(
        (item) =>
          String(item.id) === String(id)
      );

    if (!car) return;

    const name =
      $("#dn")?.value.trim();

    const phone =
      $("#dp")?.value.trim();

    const date =
      $("#dd")?.value;

    const time =
      $("#dt")?.value;

    if (!name || !phone || !date) {
      toast("أكمل بيانات الحجز");
      return;
    }

    const leads =
      get(KEYS.leads, []);

    leads.unshift({
      id: uid("LEAD"),
      type: "تجربة قيادة",
      car: car.name,
      name,
      phone,
      date,
      time,
      createdAt: now(),
      status: "جديد"
    });

    set(KEYS.leads, leads);

    wa(
      `حجز تجربة قيادة

السيارة: ${car.name}
الاسم: ${name}
الهاتف: ${phone}
التاريخ: ${date}
الوقت: ${time}`
    );

    closeModal();

    toast("تم تجهيز حجز تجربة القيادة");
  }

  window.submitDrive =
    submitDrive;

  /* =========================================================
     19. FINANCE CALCULATOR
     ========================================================= */

  function finance() {

    openModal(`

      <button
        class="close"
        onclick="closeModal()"
      >
        ×
      </button>

      <h2>
        حاسبة التمويل الذكية
      </h2>

      <div class="formgrid">

        <input
          class="field"
          id="fp"
          type="number"
          value="30000"
          placeholder="السعر"
        >

        <input
          class="field"
          id="fd"
          type="number"
          value="20"
          placeholder="الدفعة %"
        >

        <input
          class="field"
          id="fr"
          type="number"
          value="6"
          step=".1"
          placeholder="النسبة السنوية"
        >

        <input
          class="field"
          id="fn"
          type="number"
          value="48"
          placeholder="عدد الأشهر"
        >

      </div>

      <button
        class="btn primary"
        style="margin-top:12px"
        onclick="calcFinance()"
      >
        احسب
      </button>

      <div
        id="fres"
        class="stat"
        style="margin-top:14px"
      ></div>

    `);
  }

  window.finance =
    finance;

  function calcFinance() {

    const price =
      Number($("#fp")?.value || 0);

    const down =
      Number($("#fd")?.value || 0);

    const rate =
      Number($("#fr")?.value || 0);

    const months =
      Number($("#fn")?.value || 0);

    if (
      price <= 0 ||
      months <= 0
    ) {
      toast("أدخل بيانات صحيحة");
      return;
    }

    const principal =
      price *
      (1 - down / 100);

    const monthlyRate =
      rate / 1200;

    let payment;

    if (monthlyRate > 0) {

      payment =
        principal *
        monthlyRate *
        Math.pow(
          1 + monthlyRate,
          months
        ) /
        (
          Math.pow(
            1 + monthlyRate,
            months
          ) - 1
        );

    } else {

      payment =
        principal / months;
    }

    const result =
      $("#fres");

    if (!result) return;

    result.innerHTML = `
      القسط التقريبي

      <br>

      <b>
        ${payment.toLocaleString(
          "en-US",
          {
            maximumFractionDigits: 0
          }
        )} $
      </b>

      <span>
        يمكن التواصل معنا لإرسال تفاصيل التمويل.
      </span>
    `;
  }

  window.calcFinance =
    calcFinance;

  /* =========================================================
     20. COMPARE VIEW
     ========================================================= */

  function compareView() {

    if (!compare.length) {
      toast("اختر سيارات للمقارنة");
      return;
    }

    const selected =
      compare
        .map((id) =>
          cars.find(
            (car) =>
              String(car.id) ===
              String(id)
          )
        )
        .filter(Boolean);

    openModal(`

      <button
        class="close"
        onclick="closeModal()"
      >
        ×
      </button>

      <h2>
        مقارنة ذكية
      </h2>

      <div class="comparetable">

        <div>
          المواصفة
        </div>

        ${selected
          .map(
            (car) => `
              <div>
                <img
                  src="${escapeHTML(car.img)}"
                  alt=""
                >
                <b>
                  ${escapeHTML(car.name)}
                </b>
              </div>
            `
          )
          .join("")}

        <div>السنة</div>

        ${selected
          .map(
            (car) =>
              `<div>${escapeHTML(car.year)}</div>`
          )
          .join("")}

        <div>الدفع</div>

        ${selected
          .map(
            (car) =>
              `<div>${escapeHTML(car.drive)}</div>`
          )
          .join("")}

        <div>الوقود</div>

        ${selected
          .map(
            (car) =>
              `<div>${escapeHTML(car.fuel)}</div>`
          )
          .join("")}

        <div>الفئة</div>

        ${selected
          .map(
            (car) =>
              `<div>${escapeHTML(car.type)}</div>`
          )
          .join("")}

        <div>السعر</div>

        ${selected
          .map(
            (car) =>
              `<div>${money(car.price)}</div>`
          )
          .join("")}

        <div>التوفر</div>

        ${selected
          .map(
            (car) =>
              `<div>${escapeHTML(
                car.stock || "متوفر"
              )}</div>`
          )
          .join("")}

      </div>

    `);
  }

  window.compareView =
    compareView;

  /* =========================================================
     21. ACCOUNT
     ========================================================= */

  function account() {

    const session =
      get(
        KEYS.customerSession,
        null
      );

    if (session?.id) {
      showLoggedAccount(session);
      return;
    }

    openModal(`

      <button
        class="close"
        onclick="closeModal()"
      >
        ×
      </button>

      <h2>
        حساب العميل
      </h2>

      <form
        onsubmit="saveCustomer(event)"
      >

        <div class="formgrid">

          <input
            class="field"
            id="cn"
            required
            placeholder="الاسم"
          >

          <input
            class="field"
            id="cp"
            required
            placeholder="رقم الهاتف"
          >

          <input
            class="field full"
            id="ce"
            type="email"
            placeholder="البريد الإلكتروني"
          >

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
        >
          حفظ الحساب
        </button>

      </form>

      <div
        class="stat"
        style="margin-top:14px"
      >
        <b>${requests.length}</b>
        <span>طلباتك المحلية</span>
      </div>

    `);
  }

  window.account =
    account;

  function saveCustomer(event) {

    event.preventDefault();

    const name =
      $("#cn")?.value.trim();

    const phone =
      $("#cp")?.value.trim();

    const email =
      $("#ce")?.value.trim();

    if (!name || !phone) {
      toast("أدخل الاسم ورقم الهاتف");
      return;
    }

    const customers =
      get(KEYS.customers, []);

    const existing =
      customers.find(
        (customer) =>
          customer.phone === phone
      );

    if (existing) {

      set(
        KEYS.customerSession,
        {
          id: existing.id,
          name: existing.name,
          phone: existing.phone,
          at: now()
        }
      );

      toast("تم فتح حسابك");

      closeModal();

      return;
    }

    const customer = {
      id: uid("CUS"),
      name,
      phone,
      email,
      createdAt: now(),
      status: "نشط"
    };

    customers.unshift(customer);

    set(
      KEYS.customers,
      customers
    );

    set(
      KEYS.customerSession,
      {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        at: now()
      }
    );

    toast("تم إنشاء الحساب");

    closeModal();
  }

  window.saveCustomer =
    saveCustomer;

  function showLoggedAccount(session) {

    const customer =
      get(KEYS.customers, [])
        .find(
          (item) =>
            item.id === session.id
        );

    const customerRequests =
      requests.filter(
        (request) =>
          request.customerId === session.id
      );

    openModal(`

      <button
        class="close"
        onclick="closeModal()"
      >
        ×
      </button>

      <h2>
        أهلاً ${escapeHTML(
          customer?.name ||
          session.name ||
          "عميلنا"
        )}
      </h2>

      <div class="stat">
        <b>
          ${customerRequests.length}
        </b>

        <span>
          طلبات الحساب
        </span>
      </div>

      <div
        style="
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          margin-top:14px;
        "
      >

        <button
          class="btn primary"
          onclick="showRequests()"
        >
          طلباتي
        </button>

        <button
          class="btn"
          onclick="customerLogout()"
        >
          تسجيل الخروج
        </button>

      </div>

    `);
  }

  function customerLogout() {

    remove(
      KEYS.customerSession
    );

    closeModal();

    toast("تم تسجيل الخروج");
  }

  window.customerLogout =
    customerLogout;

  /* =========================================================
     22. FAVORITES VIEW
     ========================================================= */

  function showFav() {

    const selected =
      [...fav]
        .map((id) =>
          cars.find(
            (car) =>
              String(car.id) ===
              String(id)
          )
        )
        .filter(Boolean);

    if (!selected.length) {
      toast("المفضلة فارغة");
      return;
    }

    openModal(`

      <button
        class="close"
        onclick="closeModal()"
      >
        ×
      </button>

      <h2>
        المفضلة
      </h2>

      <div class="carsgrid">

        ${selected
          .map(card)
          .join("")}

      </div>

    `);
  }

  window.showFav =
    showFav;

  /* =========================================================
     23. REQUESTS VIEW
     ========================================================= */

  function showRequests() {

    if (!requests.length) {
      toast("لا توجد طلبات");
      return;
    }

    openModal(`

      <button
        class="close"
        onclick="closeModal()"
      >
        ×
      </button>

      <h2>
        طلباتي
      </h2>

      ${requests
        .map(
          (request) => `

            <div
              class="stat"
              style="margin:8px 0"
            >

              <b>
                ${escapeHTML(
                  request.name ||
                  request.car ||
                  "طلب"
                )}
              </b>

              <span>
                ${escapeHTML(
                  request.status ||
                  "جديد"
                )}
                •
                ${new Date(
                  request.date ||
                  request.createdAt ||
                  now()
                ).toLocaleString("ar")}
              </span>

            </div>
          `
        )
        .join("")}

    `);
  }

  window.showRequests =
    showRequests;

  /* =========================================================
     24. SMART SEARCH
     ========================================================= */

  function smartSearch(value) {

    const query =
      String(value || "")
        .toLowerCase()
        .trim();

    const hints = [
      "كهربائية",
      "4×4",
      "بيك أب",
      "SUV",
      "2026",
      "RIDDARA"
    ];

    const matched =
      cars.filter((car) => {

        const text = [
          car.name,
          car.brand,
          car.type,
          car.fuel,
          car.drive,
          car.year,
          car.tag
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      });

    const output =
      $("#smartResult");

    if (output) {

      output.innerHTML =
        matched.length
          ? `وجدت <b>${matched.length}</b> سيارة مناسبة لبحثك.`
          : `لم أجد تطابقاً مباشراً — جرّب: ${hints.join("، ")}`;
    }

    return matched;
  }

  window.smartSearch =
    smartSearch;

  /* =========================================================
     25. V20 SEARCH
     ========================================================= */

  function v20Search(value) {

    const query =
      String(value || "")
        .toLowerCase()
        .trim();

    const terms =
      query
        .split(/\s+/)
        .filter(Boolean);

    const elements =
      $$("[data-car-search]");

    let visible = 0;

    elements.forEach((element) => {

      const text =
        (
          element.dataset.carSearch ||
          element.textContent ||
          ""
        ).toLowerCase();

      const show =
        terms.every(
          (term) =>
            text.includes(term)
        );

      element.style.display =
        show ? "" : "none";

      if (show) visible++;
    });

    const result =
      $("#v11SearchResult");

    if (result) {

      result.textContent =
        query
          ? `${visible} سيارة مطابقة للبحث`
          : "اكتب اسم السيارة أو الماركة أو الفئة";
    }

    return visible;
  }

  window.v11SmartSearch =
    v20Search;

  window.v20SmartSearch =
    v20Search;

  /* =========================================================
     26. LEADS
     ========================================================= */

  function addLead(data = {}) {

    const leads =
      get(KEYS.leads, []);

    const lead = {
      id: uid("LEAD"),
      type: data.type || "استفسار",
      car: data.car || "",
      name: data.name || "",
      phone: data.phone || "",
      note: data.note || "",
      createdAt: now(),
      status: "جديد"
    };

    leads.unshift(lead);

    set(
      KEYS.leads,
      leads
    );

    return lead;
  }

  window.v11Lead =
    function (
      type = "استفسار",
      car = ""
    ) {
      addLead({
        type,
        car
      });

      toast(
        "تم تسجيل طلبك بنجاح"
      );
    };

  /* =========================================================
     27. LEAD MODAL
     ========================================================= */

  function openLead(carName = "") {

    let modal =
      $("#v11LeadModal");

    if (!modal) {

      modal =
        document.createElement("div");

      modal.id =
        "v11LeadModal";

      modal.className =
        "v11-modal";

      modal.innerHTML = `

        <div
          class="v11-modal-box v11-glass"
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:10px;
              align-items:center;
            "
          >

            <h3 style="margin:0">
              طلب معلومات / حجز تجربة قيادة
            </h3>

            <button
              class="btn"
              onclick="v11CloseLead()"
            >
              ✕
            </button>

          </div>

          <p
            id="v11LeadCar"
            style="opacity:.7"
          ></p>

          <div class="v11-grid2">

            <div class="v11-field">

              <label>
                الاسم
              </label>

              <input
                id="v11Name"
                placeholder="اسمك"
              >

            </div>

            <div class="v11-field">

              <label>
                الهاتف
              </label>

              <input
                id="v11Phone"
                placeholder="رقم الهاتف"
              >

            </div>

          </div>

          <div class="v11-field">

            <label>
              نوع الطلب
            </label>

            <select id="v11Type">

              <option>
                استفسار
              </option>

              <option>
                حجز تجربة قيادة
              </option>

              <option>
                طلب تمويل
              </option>

              <option>
                طلب شراء
              </option>

            </select>

          </div>

          <div class="v11-field">

            <label>
              ملاحظات
            </label>

            <textarea
              id="v11Note"
              placeholder="اكتب طلبك هنا"
            ></textarea>

          </div>

          <button
            class="btn primary"
            onclick="v11SubmitLead()"
          >
            إرسال الطلب
          </button>

        </div>
      `;

      document.body.appendChild(modal);
    }

    modal.dataset.car =
      carName;

    modal.classList.add("show");

    const title =
      $("#v11LeadCar");

    if (title) {

      title.textContent =
        carName
          ? `السيارة: ${carName}`
          : "تواصل مع معرض الراعبي أوتو كارز";
    }
  }

  window.v11OpenLead =
    openLead;

  window.v20OpenLead =
    openLead;

  window.v11CloseLead =
    function () {
      $("#v11LeadModal")
        ?.classList.remove("show");
    };

  window.v11SubmitLead =
    function () {

      const name =
        $("#v11Name")
          ?.value.trim();

      const phone =
        $("#v11Phone")
          ?.value.trim();

      const type =
        $("#v11Type")
          ?.value ||
        "استفسار";

      const note =
        $("#v11Note")
          ?.value.trim();

      const modal =
        $("#v11LeadModal");

      const car =
        modal?.dataset.car ||
        "";

      if (!name || !phone) {
        toast(
          "أدخل الاسم ورقم الهاتف"
        );
        return;
      }

      addLead({
        type,
        car,
        name,
        phone,
        note
      });

      wa(
        `طلب من الراعبي أوتو كارز

نوع الطلب: ${type}
السيارة: ${car || "غير محددة"}
الاسم: ${name}
الهاتف: ${phone}
الملاحظات: ${note || "لا توجد"}`
      );

      modal?.classList.remove(
        "show"
      );

      toast(
        "شكراً لك — تم إرسال الطلب"
      );
    };

  /* =========================================================
     28. ADMIN DATABASE
     ========================================================= */

  const ADMIN = {

    getDB() {

      return {
        cars: get(
          KEYS.cars,
          []
        ),

        customers: get(
          KEYS.customers,
          []
        ),

        orders: get(
          KEYS.orders,
          []
        ),

        leads: get(
          KEYS.leads,
          []
        ),

        settings: get(
          KEYS.settings,
          {
            siteName:
              "ALRAEBI AUTO CARS",
            currency:
              "USD"
          }
        )
      };
    },

    saveDB(db) {

      set(
        KEYS.cars,
        db.cars || []
      );

      set(
        KEYS.customers,
        db.customers || []
      );

      set(
        KEYS.orders,
        db.orders || []
      );

      set(
        KEYS.leads,
        db.leads || []
      );

      set(
        KEYS.settings,
        db.settings || {}
      );

      cars =
        get(
          KEYS.cars,
          []
        ).map(normalizeCar);
    }
  };

  window.RAC20 =
    ADMIN;

  /* =========================================================
     29. ADMIN LOGIN
     ========================================================= */

  function adminLogin(
    username,
    password
  ) {

    const user =
      String(username || "")
        .trim();

    const pass =
      String(password || "");

    /*
      Local/demo login.
      For production replace with backend authentication.
    */

    if (
      user === "admin" &&
      pass === "1234"
    ) {

      const session = {
        user: "admin",
        role: "owner",
        at: Date.now()
      };

      set(
        KEYS.adminSession,
        session
      );

      toast(
        "تم تسجيل الدخول بنجاح"
      );

      setTimeout(() => {
        location.href =
          "admin.html";
      }, 300);

      return true;
    }

    toast(
      "بيانات الدخول غير صحيحة"
    );

    return false;
  }

  window.v13Login =
    adminLogin;

  window.v20AdminLogin =
    adminLogin;

  function adminLogout() {

    remove(
      KEYS.adminSession
    );

    location.href =
      "index.html";
  }

  window.v13Logout =
    adminLogout;

  window.v20AdminLogout =
    adminLogout;

  /* =========================================================
     30. ADMIN — CAR MANAGEMENT
     ========================================================= */

  function addCar(data) {

    const car =
      normalizeCar(
        {
          ...data,
          id:
            data.id ||
            uid("CAR")
        }
      );

    cars.unshift(car);

    saveCars();

    render();

    toast(
      "تمت إضافة السيارة"
    );

    return car;
  }

  function updateCar(data) {

    const index =
      cars.findIndex(
        (car) =>
          String(car.id) ===
          String(data.id)
      );

    if (index < 0) {
      toast(
        "السيارة غير موجودة"
      );
      return false;
    }

    cars[index] =
      normalizeCar({
        ...cars[index],
        ...data,
        id: cars[index].id
      });

    saveCars();

    render();

    toast(
      "تم تحديث السيارة"
    );

    return true;
  }

  function deleteCar(id) {

    const car =
      cars.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    if (!car) return;

    if (
      !confirm(
        `هل تريد حذف ${car.name}؟`
      )
    ) {
      return;
    }

    cars =
      cars.filter(
        (item) =>
          String(item.id) !==
          String(id)
      );

    fav.delete(String(id));

    compare =
      compare.filter(
        (item) =>
          String(item) !==
          String(id)
      );

    saveCars();
    saveFav();
    saveCompare();

    render();

    if (
      typeof window.renderV20Admin ===
      "function"
    ) {
      window.renderV20Admin();
    }

    toast(
      "تم حذف السيارة"
    );
  }

  window.v12SaveCar =
    addCar;

  window.v13AddCar =
    addCar;

  window.v12DeleteCar =
    deleteCar;

  window.v13DeleteCar =
    deleteCar;

  window.v13UpdateCar =
    updateCar;

  window.v20AddCar =
    addCar;

  window.v20UpdateCar =
    updateCar;

  window.v20DeleteCar =
    deleteCar;

  function saveCar(data) {

    if (data.id) {
      return updateCar(data);
    }

    return addCar(data);
  }

  window.v12SaveCar =
    saveCar;

  /* =========================================================
     31. IMAGE READER
     ========================================================= */

  function readImages(
    files,
    callback,
    limit = 10
  ) {

    files =
      [...(files || [])]
        .slice(0, limit);

    if (!files.length) {
      callback([]);
      return;
    }

    const output =
      new Array(files.length);

    let completed = 0;

    files.forEach(
      (file, index) => {

        const reader =
          new FileReader();

        reader.onload = () => {

          output[index] =
            reader.result;

          completed++;

          if (
            completed ===
            files.length
          ) {
            callback(output);
          }
        };

        reader.onerror = () => {

          completed++;

          if (
            completed ===
            files.length
          ) {
            callback(
              output.filter(Boolean)
            );
          }
        };

        reader.readAsDataURL(file);
      }
    );
  }

  window.v13ReadImages =
    readImages;

  window.v12FileToDataURL =
    function (file, callback) {

      const reader =
        new FileReader();

      reader.onload = () =>
        callback(
          reader.result
        );

      reader.readAsDataURL(file);
    };

  /* =========================================================
     32. IMAGE PREVIEW
     ========================================================= */

  function imagePreview(input) {

    const box =
      $("#v20ImagePreview") ||
      $("#v13Preview") ||
      $("#v12ImagePreview");

    if (!box) return;

    box.innerHTML = "";

    readImages(
      input?.files,
      (images) => {

        box.innerHTML =
          images
            .map(
              (src) => `
                <img
                  src="${src}"
                  style="
                    width:90px;
                    height:70px;
                    object-fit:cover;
                    border-radius:10px;
                    margin:3px;
                  "
                >
              `
            )
            .join("");
      }
    );
  }

  window.v13Preview =
    imagePreview;

  window.v12ImagePreview =
    imagePreview;

  window.v20ImagePreview =
    imagePreview;

  /* =========================================================
     33. CUSTOMER MANAGEMENT
     ========================================================= */

  function addCustomer(data) {

    const customers =
      get(
        KEYS.customers,
        []
      );

    const existing =
      customers.find(
        (customer) =>
          customer.phone ===
          data.phone
      );

    if (existing) {
      return existing;
    }

    const customer = {
      id:
        uid("CUS"),
      createdAt:
        now(),
      status:
        "نشط",
      ...data
    };

    customers.unshift(
      customer
    );

    set(
      KEYS.customers,
      customers
    );

    return customer;
  }

  window.v12AddCustomer =
    function (data) {

      const customer =
        addCustomer(data);

      toast(
        "تم حفظ العميل"
      );

      return customer;
    };

  /* =========================================================
     34. ORDERS
     ========================================================= */

  function addOrder(data) {

    const orders =
      get(
        KEYS.orders,
        []
      );

    const order = {
      id:
        uid("ORD"),
      createdAt:
        now(),
      status:
        "جديد",
      ...data
    };

    orders.unshift(
      order
    );

    set(
      KEYS.orders,
      orders
    );

    return order;
  }

  window.v12AddOrder =
    function (data) {

      const order =
        addOrder(data);

      toast(
        "تم إنشاء الطلب"
      );

      return order;
    };

  function updateOrder(
    id,
    status
  ) {

    const orders =
      get(
        KEYS.orders,
        []
      );

    const order =
      orders.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    if (order) {
      order.status =
        status;
    }

    set(
      KEYS.orders,
      orders
    );

    if (
      typeof window.renderV20Admin ===
      "function"
    ) {
      window.renderV20Admin();
    }

    toast(
      "تم تحديث حالة الطلب"
    );
  }

  window.v12OrderStatus =
    updateOrder;

  window.v13UpdateOrder =
    updateOrder;

  /* =========================================================
     35. ADMIN DASHBOARD
     ========================================================= */

  function renderV20Admin() {

    const root =
      $("#v20AdminRoot") ||
      $("#v13AdminRoot") ||
      $("#v12AdminRoot");

    if (!root) return;

    const db =
      ADMIN.getDB();

    root.innerHTML = `

      <div class="v13-grid">

        <div class="v13-card v12-panel">

          <small>
            المخزون
          </small>

          <div class="v13-number">
            ${db.cars.length}
          </div>

        </div>

        <div class="v13-card v12-panel">

          <small>
            العملاء
          </small>

          <div class="v13-number">
            ${db.customers.length}
          </div>

        </div>

        <div class="v13-card v12-panel">

          <small>
            الطلبات
          </small>

          <div class="v13-number">
            ${db.orders.length}
          </div>

        </div>

        <div class="v13-card v12-panel">

          <small>
            الاستفسارات
          </small>

          <div class="v13-number">
            ${db.leads.length}
          </div>

        </div>

      </div>

      <div
        class="v12-panel"
        style="padding:18px;margin-top:14px"
      >

        <div class="v13-tabs">

          <button
            class="btn primary"
            onclick="v20AdminTab('cars')"
          >
            🚘 المخزون
          </button>

          <button
            class="btn"
            onclick="v20AdminTab('add')"
          >
            ➕ إضافة سيارة
          </button>

          <button
            class="btn"
            onclick="v20AdminTab('orders')"
          >
            📦 الطلبات
          </button>

          <button
            class="btn"
            onclick="v20AdminTab('customers')"
          >
            👤 العملاء
          </button>

          <button
            class="btn"
            onclick="v20AdminTab('leads')"
          >
            🎯 الاستفسارات
          </button>

          <button
            class="btn"
            onclick="v20AdminTab('tools')"
          >
            🛠 النظام
          </button>

        </div>

        <div
          id="v20AdminArea"
          style="margin-top:16px"
        ></div>

      </div>
    `;

    v20AdminTab("cars");
  }

  window.renderV20Admin =
    renderV20Admin;

  window.renderV13Admin =
    renderV20Admin;

  window.renderV12Admin =
    renderV20Admin;

  /* =========================================================
     36. ADMIN TABS
     ========================================================= */

  function v20AdminTab(tab) {

    const area =
      $("#v20AdminArea") ||
      $("#v13Area") ||
      $("#v12TabArea");

    if (!area) return;

    const db =
      ADMIN.getDB();

    /* ---------------- INVENTORY ---------------- */

    if (tab === "cars") {

      area.innerHTML =
        db.cars.length
          ? `

          <div
            style="overflow:auto"
            class="v13-tablewrap"
          >

            <table
              class="v12-table v13-table"
            >

              <thead>

                <tr>

                  <th>
                    السيارة
                  </th>

                  <th>
                    الفئة
                  </th>

                  <th>
                    السعر
                  </th>

                  <th>
                    الحالة
                  </th>

                  <th>
                    إجراء
                  </th>

                </tr>

              </thead>

              <tbody>

                ${db.cars
                  .map(
                    (car) => `

                    <tr>

                      <td>

                        <b>
                          ${escapeHTML(
                            car.name
                          )}
                        </b>

                        <br>

                        <small>
                          ${escapeHTML(
                            car.brand
                          )}
                        </small>

                      </td>

                      <td>
                        ${escapeHTML(
                          car.type
                        )}
                      </td>

                      <td>
                        ${money(car.price)}
                      </td>

                      <td>
                        ${escapeHTML(
                          car.status ||
                          car.stock ||
                          "متوفر"
                        )}
                      </td>

                      <td>

                        <button
                          class="btn"
                          onclick="v20EditCar('${escapeHTML(
                            car.id
                          )}')"
                        >
                          تعديل
                        </button>

                        <button
                          class="btn"
                          onclick="v20DeleteCar('${escapeHTML(
                            car.id
                          )}')"
                        >
                          حذف
                        </button>

                      </td>

                    </tr>
                  `
                  )
                  .join("")}

              </tbody>

            </table>

          </div>
        `
          : `
            <div class="v11-empty">
              لا توجد سيارات
            </div>
          `;

      return;
    }

    /* ---------------- ADD ---------------- */

    if (tab === "add") {

      area.innerHTML = `

        <form
          class="v12-form"
          onsubmit="
            event.preventDefault();
            v20SubmitCar(this)
          "
        >

          <label>
            اسم السيارة

            <input
              name="name"
              required
              placeholder="مثال: RIDDARA RD6"
            >

          </label>

          <label>
            الماركة

            <input
              name="brand"
              placeholder="RIDDARA"
            >

          </label>

          <label>
            الفئة

            <input
              name="type"
              placeholder="SUV / بيك أب"
            >

          </label>

          <label>
            السنة

            <input
              name="year"
              type="number"
              value="2026"
            >

          </label>

          <label>
            السعر بالدولار

            <input
              name="price"
              type="number"
              min="0"
              placeholder="0 = اتصل للسعر"
            >

          </label>

          <label>
            الكمية

            <input
              name="stock"
              type="number"
              min="0"
              value="1"
            >

          </label>

          <label>
            الوقود

            <select name="fuel">

              <option>
                كهربائية
              </option>

              <option>
                بنزين
              </option>

              <option>
                هايبرد
              </option>

              <option>
                ديزل
              </option>

            </select>

          </label>

          <label>
            الدفع

            <select name="drive">

              <option>
                4×4
              </option>

              <option>
                2WD
              </option>

              <option>
                AWD
              </option>

            </select>

          </label>

          <label>
            الحالة

            <select name="status">

              <option>
                متوفر
              </option>

              <option>
                محجوز
              </option>

              <option>
                مباع
              </option>

              <option>
                غير متوفر
              </option>

            </select>

          </label>

          <label>
            الشارة

            <input
              name="tag"
              placeholder="NEW / PREMIUM"
            >

          </label>

          <label class="full">

            الوصف

            <textarea
              name="description"
            ></textarea>

          </label>

          <label class="full v12-drop">

            📷 صور السيارة

            <input
              id="v20Images"
              type="file"
              accept="image/*"
              multiple
              hidden
              onchange="v20ImagePreview(this)"
            >

            <div
              id="v20ImagePreview"
              onclick="document.getElementById('v20Images').click()"
            >
              اضغط لاختيار الصور
            </div>

          </label>

          <div class="full">

            <button
              class="btn primary"
              type="submit"
            >
              حفظ السيارة
            </button>

          </div>

        </form>
      `;

      return;
    }

    /* ---------------- ORDERS ---------------- */

    if (tab === "orders") {

      area.innerHTML =
        db.orders.length
          ? `

          <div
            style="overflow:auto"
            class="v13-tablewrap"
          >

            <table
              class="v12-table v13-table"
            >

              <thead>

                <tr>

                  <th>
                    الطلب
                  </th>

                  <th>
                    العميل
                  </th>

                  <th>
                    السيارة
                  </th>

                  <th>
                    الحالة
                  </th>

                </tr>

              </thead>

              <tbody>

                ${db.orders
                  .map(
                    (order) => `

                    <tr>

                      <td>
                        ${escapeHTML(
                          order.id
                        )}

                        <br>

                        <small>
                          ${new Date(
                            order.createdAt ||
                            now()
                          ).toLocaleString("ar")}
                        </small>

                      </td>

                      <td>

                        ${escapeHTML(
                          order.name ||
                          "—"
                        )}

                        <br>

                        ${escapeHTML(
                          order.phone ||
                          ""
                        )}

                      </td>

                      <td>
                        ${escapeHTML(
                          order.car ||
                          "—"
                        )}
                      </td>

                      <td>

                        <select
                          class="v13-input"
                          onchange="v20OrderStatus(
                            '${escapeHTML(order.id)}',
                            this.value
                          )"
                        >

                          ${[
                            "جديد",
                            "قيد المتابعة",
                            "تم التواصل",
                            "مكتمل",
                            "ملغي"
                          ]
                            .map(
                              (status) =>
                                `<option ${
                                  order.status ===
                                  status
                                    ? "selected"
                                    : ""
                                }>
                                  ${status}
                                </option>`
                            )
                            .join("")}

                        </select>

                      </td>

                    </tr>
                  `
                  )
                  .join("")}

              </tbody>

            </table>

          </div>
        `
          : `
            <div class="v11-empty">
              لا توجد طلبات
            </div>
          `;

      return;
    }

    /* ---------------- CUSTOMERS ---------------- */

    if (tab === "customers") {

      area.innerHTML =
        db.customers.length
          ? `

          <div
            style="overflow:auto"
            class="v13-tablewrap"
          >

            <table
              class="v12-table v13-table"
            >

              <thead>

                <tr>

                  <th>
                    الاسم
                  </th>

                  <th>
                    الهاتف
                  </th>

                  <th>
                    التاريخ
                  </th>

                  <th>
                    الحالة
                  </th>

                </tr>

              </thead>

              <tbody>

                ${db.customers
                  .map(
                    (customer) => `

                    <tr>

                      <td>
                        ${escapeHTML(
                          customer.name ||
                          "—"
                        )}
                      </td>

                      <td>
                        ${escapeHTML(
                          customer.phone ||
                          "—"
                        )}
                      </td>

                      <td>
                        ${new Date(
                          customer.createdAt ||
                          now()
                        ).toLocaleDateString(
                          "ar"
                        )}
                      </td>

                      <td>
                        ${escapeHTML(
                          customer.status ||
                          "نشط"
                        )}
                      </td>

                    </tr>
                  `
                  )
                  .join("")}

              </tbody>

            </table>

          </div>
        `
          : `
            <div class="v11-empty">
              لا يوجد عملاء
            </div>
          `;

      return;
    }

    /* ---------------- LEADS ---------------- */

    if (tab === "leads") {

      area.innerHTML =
        db.leads.length
          ? db.leads
              .map(
                (lead) => `

                <div
                  class="v12-panel"
                  style="
                    padding:14px;
                    margin:8px 0;
                  "
                >

                  <b>
                    ${escapeHTML(
                      lead.name ||
                      "عميل"
                    )}
                  </b>

                  ·

                  ${escapeHTML(
                    lead.phone ||
                    ""
                  )}

                  <br>

                  <small>

                    ${escapeHTML(
                      lead.type ||
                      "استفسار"
                    )}

                    ·

                    ${escapeHTML(
                      lead.car ||
                      ""
                    )}

                    ·

                    ${escapeHTML(
                      lead.note ||
                      ""
                    )}

                  </small>

                </div>
              `
              )
              .join("")
          : `
            <div class="v11-empty">
              لا توجد استفسارات
            </div>
          `;

      return;
    }

    /* ---------------- TOOLS ---------------- */

    area.innerHTML = `

      <div class="v13-actions">

        <button
          class="btn primary"
          onclick="v20Backup()"
        >
          💾 نسخة احتياطية
        </button>

        <label class="btn">

          ♻️ استعادة

          <input
            type="file"
            accept=".json"
            hidden
            onchange="v20Restore(this.files[0])"
          >

        </label>

        <button
          class="btn"
          onclick="location.href='index.html'"
        >
          🌐 المعرض
        </button>

        <button
          class="btn"
          onclick="v20ResetDemo()"
        >
          🗑️ مسح بيانات V20
        </button>

      </div>

      <div
        class="v13-success"
        style="margin-top:14px"
      >
        ALRAEBI AUTO CARS V20
        <br>
        نظام موحد للمخزون والعملاء والطلبات والاستفسارات.
        <br>
        الواجهة الأصلية لموقعك محفوظة ولا يتم تغيير تصميمها.
      </div>
    `;
  }

  window.v20AdminTab =
    v20AdminTab;

  window.v13Tab =
    v20AdminTab;

  window.v12ShowTab =
    v20AdminTab;

  /* =========================================================
     37. ADMIN ADD CAR
     ========================================================= */

  function submitCarForm(form) {

    const data = {};

    new FormData(form)
      .forEach(
        (value, key) => {
          data[key] = value;
        }
      );

    data.price =
      Number(data.price || 0);

    data.stock =
      Number(data.stock || 0);

    data.year =
      Number(data.year || 2026);

    const files =
      $("#v20Images")?.files;

    readImages(
      files,
      (images) => {

        if (images.length) {

          data.images =
            images;

          data.img =
            images[0];

          data.image =
            images[0];
        }

        addCar(data);

        renderV20Admin();
      },
      10
    );
  }

  window.v20SubmitCar =
    submitCarForm;

  window.v13SubmitCar =
    submitCarForm;

  window.v12FormSave =
    submitCarForm;

  /* =========================================================
     38. ADMIN EDIT CAR
     ========================================================= */

  function editCar(id) {

    const car =
      cars.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    if (!car) return;

    const area =
      $("#v20AdminArea") ||
      $("#v13Area") ||
      $("#v12TabArea");

    if (!area) return;

    area.innerHTML = `

      <form
        class="v12-form"
        onsubmit="
          event.preventDefault();
          v20EditSubmit(this,'${escapeHTML(
            car.id
          )}')
        "
      >

        <label>
          اسم السيارة

          <input
            name="name"
            value="${escapeHTML(
              car.name
            )}"
            required
          >

        </label>

        <label>
          الماركة

          <input
            name="brand"
            value="${escapeHTML(
              car.brand
            )}"
          >

        </label>

        <label>
          الفئة

          <input
            name="type"
            value="${escapeHTML(
              car.type
            )}"
          >

        </label>

        <label>
          السنة

          <input
            name="year"
            type="number"
            value="${escapeHTML(
              car.year
            )}"
          >

        </label>

        <label>
          السعر

          <input
            name="price"
            type="number"
            value="${escapeHTML(
              car.price
            )}"
          >

        </label>

        <label>
          الكمية

          <input
            name="stock"
            type="number"
            min="0"
            value="${escapeHTML(
              car.stock ?? 0
            )}"
          >

        </label>

        <label>
          الوقود

          <select name="fuel">

            ${[
              "كهربائية",
              "بنزين",
              "هايبرد",
              "ديزل"
            ]
              .map(
                (item) =>
                  `<option ${
                    car.fuel === item
                      ? "selected"
                      : ""
                  }>
                    ${item}
                  </option>`
              )
              .join("")}

          </select>

        </label>

        <label>
          الدفع

          <select name="drive">

            ${[
              "4×4",
              "2WD",
              "AWD"
            ]
              .map(
                (item) =>
                  `<option ${
                    car.drive === item
                      ? "selected"
                      : ""
                  }>
                    ${item}
                  </option>`
              )
              .join("")}

          </select>

        </label>

        <label>
          الحالة

          <select name="status">

            ${[
              "متوفر",
              "محجوز",
              "مباع",
              "غير متوفر"
            ]
              .map(
                (item) =>
                  `<option ${
                    car.status === item
                      ? "selected"
                      : ""
                  }>
                    ${item}
                  </option>`
              )
              .join("")}

          </select>

        </label>

        <label>
          الشارة

          <input
            name="tag"
            value="${escapeHTML(
              car.tag || ""
            )}"
          >

        </label>

        <label class="full">

          الوصف

          <textarea
            name="description"
          >${escapeHTML(
            car.description || ""
          )}</textarea>

        </label>

        <label class="full">

          تغيير الصور

          <input
            id="v20EditImages"
            type="file"
            accept="image/*"
            multiple
          >

        </label>

        <div class="full">

          <button
            class="btn primary"
            type="submit"
          >
            حفظ التعديلات
          </button>

          <button
            type="button"
            class="btn"
            onclick="v20AdminTab('cars')"
          >
            رجوع
          </button>

        </div>

      </form>
    `;
  }

  window.v20EditCar =
    editCar;

  window.v13Edit =
    function (car) {

      if (
        typeof car ===
        "string"
      ) {
        editCar(car);
      } else {
        editCar(car.id);
      }
    };

  function editSubmit(
    form,
    id
  ) {

    const data = {
      id
    };

    new FormData(form)
      .forEach(
        (value, key) => {
          data[key] = value;
        }
      );

    data.price =
      Number(data.price || 0);

    data.stock =
      Number(data.stock || 0);

    data.year =
      Number(data.year || 2026);

    const files =
      $("#v20EditImages")
        ?.files;

    readImages(
      files,
      (images) => {

        if (images.length) {

          data.images =
            images;

          data.img =
            images[0];

          data.image =
            images[0];
        }

        updateCar(data);

        renderV20Admin();
      },
      10
    );
  }

  window.v20EditSubmit =
    editSubmit;

  window.v13EditSubmit =
    editSubmit;

  /* =========================================================
     39. BACKUP
     ========================================================= */

  function backup() {

    const data = {

      version:
        "ALRAEBI AUTO CARS V20",

      createdAt:
        now(),

      cars:
        get(KEYS.cars, []),

      favorites:
        get(KEYS.fav, []),

      compare:
        get(KEYS.compare, []),

      requests:
        get(KEYS.requests, []),

      customers:
        get(KEYS.customers, []),

      orders:
        get(KEYS.orders, []),

      leads:
        get(KEYS.leads, []),

      settings:
        get(KEYS.settings, {})

    };

    const blob =
      new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href =
      url;

    a.download =
      "ALRAEBI_AUTO_CARS_V20_BACKUP.json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    setTimeout(
      () =>
        URL.revokeObjectURL(url),
      1000
    );

    toast(
      "تم إنشاء النسخة الاحتياطية"
    );
  }

  window.v20Backup =
    backup;

  window.v13Backup =
    backup;

  window.v12Backup =
    backup;

  /* =========================================================
     40. RESTORE
     ========================================================= */

  function restore(file) {

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload =
      () => {

        try {

          const data =
            JSON.parse(
              reader.result
            );

          if (
            Array.isArray(
              data.cars
            )
          ) {

            cars =
              data.cars
                .map(normalizeCar);

            saveCars();
          }

          if (
            Array.isArray(
              data.favorites
            )
          ) {
            set(
              KEYS.fav,
              data.favorites
            );
          }

          if (
            Array.isArray(
              data.compare
            )
          ) {
            set(
              KEYS.compare,
              data.compare
            );
          }

          if (
            Array.isArray(
              data.requests
            )
          ) {
            set(
              KEYS.requests,
              data.requests
            );
          }

          if (
            Array.isArray(
              data.customers
            )
          ) {
            set(
              KEYS.customers,
              data.customers
            );
          }

          if (
            Array.isArray(
              data.orders
            )
          ) {
            set(
              KEYS.orders,
              data.orders
            );
          }

          if (
            Array.isArray(
              data.leads
            )
          ) {
            set(
              KEYS.leads,
              data.leads
            );
          }

          if (data.settings) {
            set(
              KEYS.settings,
              data.settings
            );
          }

          fav =
            new Set(
              get(
                KEYS.fav,
                []
              ).map(String)
            );

          compare =
            get(
              KEYS.compare,
              []
            ).map(String);

          requests =
            get(
              KEYS.requests,
              []
            );

          render();

          toast(
            "تمت استعادة البيانات بنجاح"
          );

          setTimeout(
            () => location.reload(),
            700
          );

        } catch {

          toast(
            "ملف النسخة الاحتياطية غير صالح"
          );
        }
      };

    reader.readAsText(file);
  }

  window.v20Restore =
    restore;

  window.v13Restore =
    restore;

  window.v12Restore =
    restore;

  /* =========================================================
     41. RESET
     ========================================================= */

  function resetDemo() {

    if (
      !confirm(
        "سيتم حذف بيانات V20 المحلية. هل أنت متأكد؟"
      )
    ) {
      return;
    }

    [
      KEYS.cars,
      KEYS.fav,
      KEYS.compare,
      KEYS.requests,
      KEYS.customers,
      KEYS.orders,
      KEYS.leads,
      KEYS.settings,
      KEYS.customerSession,
      KEYS.adminSession
    ].forEach(remove);

    toast(
      "تم مسح بيانات V20"
    );

    setTimeout(
      () => location.reload(),
      600
    );
  }

  window.v20ResetDemo =
    resetDemo;

  /* =========================================================
     42. EXPORT COMPATIBILITY
     ========================================================= */

  window.v11Export =
    backup;

  window.v11Import =
    restore;

  /* =========================================================
     43. SITE SETTINGS
     ========================================================= */

  function getSettings() {

    return get(
      KEYS.settings,
      {
        siteName:
          "ALRAEBI AUTO CARS",
        currency:
          "USD"
      }
    );
  }

  window.v20Settings =
    getSettings;

  function saveSettings(
    data
  ) {

    const settings = {
      ...getSettings(),
      ...data
    };

    set(
      KEYS.settings,
      settings
    );

    applySettings();

    toast(
      "تم حفظ إعدادات الموقع"
    );
  }

  window.v20SaveSettings =
    saveSettings;

  function applySettings() {

    const settings =
      getSettings();

    if (
      settings.siteName
    ) {

      $$(
        "[data-site-name]"
      ).forEach(
        (element) => {
          element.textContent =
            settings.siteName;
        }
      );

      if (
        document.title.includes(
          "ALRAEBI"
        )
      ) {
        document.title =
          settings.siteName;
      }
    }
  }

  /* =========================================================
     44. MOBILE NAV
     ========================================================= */

  function bindNavigation() {

    $$(".nav-link").forEach(
      (link) => {

        link.addEventListener(
          "click",
          () => {

            $$(".nav-link")
              .forEach(
                (item) =>
                  item.classList.remove(
                    "active"
                  )
              );

            link.classList.add(
              "active"
            );
          }
        );
      }
    );
  }

  /* =========================================================
     45. EVENTS
     ========================================================= */

  function bindEvents() {

    [
      "q",
      "brand",
      "type",
      "sort"
    ].forEach(
      (id) => {

        const element =
          $(`#${id}`);

        if (!element) return;

        element.addEventListener(
          "input",
          render
        );

        element.addEventListener(
          "change",
          render
        );
      }
    );

    $("#compareOpen")
      ?.addEventListener(
        "click",
        compareView
      );

    $("#financeOpen")
      ?.addEventListener(
        "click",
        finance
      );

    $("#accountOpen")
      ?.addEventListener(
        "click",
        account
      );

    $("#favOpen")
      ?.addEventListener(
        "click",
        showFav
      );

    $("#reqOpen")
      ?.addEventListener(
        "click",
        showRequests
      );

    $("#modal")
      ?.addEventListener(
        "click",
        (event) => {

          if (
            event.target.id ===
            "modal"
          ) {
            closeModal();
          }
        }
      );

    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key ===
          "Escape"
        ) {
          closeModal();

          $(
            "#v11LeadModal"
          )?.classList.remove(
            "show"
          );
        }
      }
    );
  }

  /* =========================================================
     46. ADMIN AUTO INIT
     ========================================================= */

  function initAdmin() {

    const root =
      $("#v20AdminRoot") ||
      $("#v13AdminRoot") ||
      $("#v12AdminRoot");

    if (!root) return;

    renderV20Admin();
  }

  /* =========================================================
     47. BODY VERSION MARKERS
     ========================================================= */

  function addVersionMarkers() {

    document.body.classList.add(
      "v20-active"
    );

    document.body.dataset.version =
      "V20";

    /*
      Do not inject new visual cards,
      badges or layouts here.
      The original design remains untouched.
    */
  }

  /* =========================================================
     48. INIT
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      /*
        Reload the latest data.
      */

      cars =
        get(
          KEYS.cars,
          FALLBACK_CARS
        ).map(normalizeCar);

      fav =
        new Set(
          get(
            KEYS.fav,
            []
          ).map(String)
        );

      compare =
        get(
          KEYS.compare,
          []
        )
          .map(String)
          .slice(0, 3);

      requests =
        get(
          KEYS.requests,
          []
        );

      addVersionMarkers();

      applySettings();

      bindEvents();

      bindNavigation();

      render();

      initAdmin();

      updateCounters();

      console.log(
        "ALRAEBI AUTO CARS V20 loaded successfully."
      );

      console.log(
        "WhatsApp:",
        WA_NUMBER
      );
    }
  );

  /* =========================================================
     49. GLOBAL API
     ========================================================= */

  window.ALRAEBI_V20 = {

    version:
      "20.0.0",

    get cars() {
      return cars;
    },

    get favorites() {
      return [...fav];
    },

    get compare() {
      return [...compare];
    },

    get requests() {
      return requests;
    },

    render,
    detail,
    wa,
    finance,
    compareView,
    toggleFav,
    toggleCompare,
    clearCompare,
    requestCar,
    testDrive,
    account,
    showFav,
    showRequests,
    addCar,
    updateCar,
    deleteCar,
    backup,
    restore,

    keys:
      KEYS,

    whatsapp:
      WA_NUMBER
  };

})();
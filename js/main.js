const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const DELIVERY_CHARGE = 99;
const STORE_EMAIL = "orders@therichlook.in";

const ICONS = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 13H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
};

const readStore = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const cart = () => readStore("trl-cart", []);
const wishlist = () => readStore("trl-wishlist", []);
const findProduct = (id) => PRODUCTS.find((product) => product.id === id);

document.addEventListener("DOMContentLoaded", () => {
  buildShell();
  bindShellActions();
  renderPage();
  updateBadges();
  document.body.classList.add("is-ready");
});

function buildShell() {
  const header = document.querySelector("[data-header]");
  const footer = document.querySelector("[data-footer]");

  if (header) {
    header.innerHTML = `
      <div class="announcement">Private styling enquiries now open in Mysuru</div>
      <nav class="nav wrap" aria-label="Primary navigation">
        <a class="brand-lockup" href="index.html" aria-label="TheRich Look home">
          <img src="images/the-rich-look-logo.jpeg" alt="TheRich Look logo">
          <span><strong>TheRich Look</strong><small>Dress Beyond Ordinary</small></span>
        </a>
        <button class="icon-button nav-toggle" type="button" aria-label="Open menu" title="Menu" data-menu-toggle>${ICONS.menu}</button>
        <div class="nav-links" data-nav-links>
          <a href="index.html">Home</a>
          <a href="shop.html">Shop</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="nav-actions">
          <button class="icon-button" type="button" aria-label="Toggle theme" title="Toggle theme" data-theme-toggle>${ICONS.sun}</button>
          <a class="icon-link" href="shop.html#wishlist" aria-label="Wishlist" title="Wishlist">${ICONS.heart}<span data-wishlist-count>0</span></a>
          <a class="icon-link" href="cart.html" aria-label="Cart" title="Cart">${ICONS.bag}<span data-cart-count>0</span></a>
        </div>
      </nav>`;
    markActiveNav();
  }

  if (footer) {
    footer.innerHTML = `
      <div class="footer-inner wrap">
        <div>
          <img class="footer-logo" src="images/the-rich-look-logo.jpeg" alt="TheRich Look logo">
          <h2>TheRich Look</h2>
          <p>Premium menswear made for confidence, elegance, and timeless daily presence.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <a href="shop.html">Shop Collection</a>
          <a href="about.html">Our Story</a>
          <a href="contact.html">Visit Store</a>
        </div>
        <div>
          <h3>Contact</h3>
          <a href="tel:+917406708408">${BRAND.phonePrimary}</a>
          <a href="tel:+918971513765">${BRAND.phoneSecondary}</a>
          <a href="https://www.instagram.com/therichlook_24/" target="_blank" rel="noreferrer">${BRAND.instagram}</a>
        </div>
        <div>
          <h3>Newsletter</h3>
          <form class="mini-form" data-newsletter>
            <input type="email" placeholder="Email address" aria-label="Email address" required>
            <button class="button gold" type="submit">Join</button>
          </form>
        </div>
      </div>
      <p class="copyright">&copy; ${new Date().getFullYear()} TheRich Look. Demo storefront ready for product replacement.</p>`;
  }

  document.documentElement.dataset.theme = localStorage.getItem("trl-theme") || "dark";
  injectStructuredData();
}

function bindShellActions() {
  document.addEventListener("click", (event) => {
    const menuButton = event.target.closest("[data-menu-toggle]");
    const themeButton = event.target.closest("[data-theme-toggle]");
    const quickButton = event.target.closest("[data-quick-view]");
    const wishButton = event.target.closest("[data-wishlist-toggle]");
    const addButton = event.target.closest("[data-add-cart]");

    if (menuButton) document.querySelector("[data-nav-links]")?.classList.toggle("open");
    if (themeButton) toggleTheme();
    if (quickButton) openQuickView(quickButton.dataset.quickView);
    if (wishButton) toggleWishlist(wishButton.dataset.wishlistToggle);
    if (addButton) addToCart(addButton.dataset.addCart, Number(addButton.dataset.qty || 1), addButton.dataset.size, addButton.dataset.color);
  });

  document.querySelector("[data-newsletter]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    toast("You are on the private list.");
    event.target.reset();
  });
}

function renderPage() {
  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "shop") renderShop();
  if (page === "product") renderProductDetail();
  if (page === "cart") renderCart();
  if (page === "checkout") renderCheckout();
  if (page === "contact") bindContact();
}

function productCard(product) {
  const wished = wishlist().includes(product.id);
  return `
    <article class="product-card">
      <a class="product-media" href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <span>${product.badge}</span>
      </a>
      <div class="product-info">
        <p>${product.category}</p>
        <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
        <div class="price-row"><strong>${money.format(product.price)}</strong><del>${money.format(product.originalPrice)}</del></div>
        <div class="card-actions">
          <button class="button small" type="button" data-quick-view="${product.id}">${ICONS.eye}<span>Quick view</span></button>
          <button class="icon-button ${wished ? "active" : ""}" type="button" aria-label="Toggle wishlist" title="Wishlist" data-wishlist-toggle="${product.id}">${ICONS.heart}</button>
          <button class="button small gold" type="button" data-add-cart="${product.id}">${ICONS.bag}<span>Add</span></button>
        </div>
      </div>
    </article>`;
}

function renderHome() {
  fillProducts("[data-new-arrivals]", PRODUCTS.slice().sort((a, b) => b.newest - a.newest).slice(0, 4));
  fillProducts("[data-best-sellers]", PRODUCTS.slice().sort((a, b) => b.popularity - a.popularity).slice(0, 4));
}

function renderShop() {
  const grid = document.querySelector("[data-shop-grid]");
  const search = document.querySelector("[data-search]");
  const category = document.querySelector("[data-category]");
  const sort = document.querySelector("[data-sort]");

  const render = () => {
    let list = PRODUCTS.filter((product) => {
      const query = search.value.toLowerCase();
      const matchesSearch = [product.name, product.category, product.description].join(" ").toLowerCase().includes(query);
      const matchesCategory = category.value === "all" || product.category === category.value;
      return matchesSearch && matchesCategory;
    });

    if (sort.value === "price-low") list.sort((a, b) => a.price - b.price);
    if (sort.value === "price-high") list.sort((a, b) => b.price - a.price);
    if (sort.value === "popular") list.sort((a, b) => b.popularity - a.popularity);
    if (sort.value === "newest") list.sort((a, b) => b.newest - a.newest);

    grid.innerHTML = list.map(productCard).join("") || `<p class="empty">No products found.</p>`;
  };

  [search, category, sort].forEach((input) => input.addEventListener("input", render));
  render();
  renderWishlistPanel();
}

function renderProductDetail() {
  const params = new URLSearchParams(location.search);
  const product = findProduct(params.get("id")) || PRODUCTS[0];
  const detail = document.querySelector("[data-product-detail]");
  const related = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  document.title = `${product.name} | TheRich Look`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", product.description);

  detail.innerHTML = `
    <section class="product-detail-grid">
      <div class="gallery">
        <img class="main-gallery" data-main-gallery src="${product.image}" alt="${product.name} - ${product.description}">
        <div class="thumbs">${product.gallery.map((image, idx) => {
          const altText = product.galleryAlt?.[idx] || product.name;
          return `<button type="button" data-thumb="${image}"><img src="${image}" alt="${altText}"></button>`;
        }).join("")}</div>
      </div>
      <div class="detail-copy">
        <p class="eyebrow">${product.category}</p>
        <h1>${product.name}</h1>
        <div class="price-row large"><strong>${money.format(product.price)}</strong><del>${money.format(product.originalPrice)}</del></div>
        <p>${product.description}</p>
        <div class="option-group"><span>Size</span>${product.sizes.map((size, index) => `<label><input type="radio" name="size" value="${size}" ${index === 1 ? "checked" : ""}>${size}</label>`).join("")}</div>
        <div class="option-group"><span>Color</span>${product.colors.map((color, index) => `<label><input type="radio" name="color" value="${color}" ${index === 0 ? "checked" : ""}>${color}</label>`).join("")}</div>
        <div class="quantity-box"><button type="button" aria-label="Decrease quantity" data-step="-1">${ICONS.minus}</button><input data-detail-qty value="1" min="1" type="number" aria-label="Quantity"><button type="button" aria-label="Increase quantity" data-step="1">${ICONS.plus}</button></div>
        <div class="detail-actions">
          <button class="button gold" type="button" data-detail-cart="${product.id}">${ICONS.bag}<span>Add to Cart</span></button>
          <button class="button" type="button" data-buy-now="${product.id}">Buy Now</button>
          <button class="icon-button" type="button" data-wishlist-toggle="${product.id}" aria-label="Add to wishlist" title="Wishlist">${ICONS.heart}</button>
        </div>
        <ul class="detail-list">${product.details.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </section>
    <section class="section"><div class="section-heading"><div><p>Complete the look</p><h2>Related Products</h2></div></div><div class="product-grid">${(related.length ? related : PRODUCTS.slice(0, 4)).map(productCard).join("")}</div></section>`;

  injectProductSchema(product);
  detail.querySelectorAll("[data-thumb]").forEach((button) => button.addEventListener("click", () => {
    detail.querySelector("[data-main-gallery]").src = button.dataset.thumb;
  }));
  detail.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => {
    const input = detail.querySelector("[data-detail-qty]");
    input.value = Math.max(1, Number(input.value) + Number(button.dataset.step));
  }));
  detail.querySelector("[data-detail-cart]").addEventListener("click", () => detailAdd(product.id, false));
  detail.querySelector("[data-buy-now]").addEventListener("click", () => detailAdd(product.id, true));
}

function detailAdd(productId, goCheckout) {
  const qty = Number(document.querySelector("[data-detail-qty]").value || 1);
  const size = document.querySelector("input[name='size']:checked")?.value;
  const color = document.querySelector("input[name='color']:checked")?.value;
  addToCart(productId, qty, size, color);
  if (goCheckout) location.href = "checkout.html";
}

function fillProducts(selector, products) {
  const target = document.querySelector(selector);
  if (target) target.innerHTML = products.map(productCard).join("");
}

function addToCart(productId, qty = 1, size = "M", color = "Matte Black") {
  const items = cart();
  const existing = items.find((item) => item.id === productId && item.size === size && item.color === color);
  if (existing) existing.qty += qty;
  else items.push({ id: productId, qty, size, color });
  writeStore("trl-cart", items);
  updateBadges();
  toast("Added to cart.");
}

function toggleWishlist(productId) {
  const items = wishlist();
  const next = items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId];
  writeStore("trl-wishlist", next);
  updateBadges();
  renderWishlistPanel();
  document.querySelectorAll(`[data-wishlist-toggle="${productId}"]`).forEach((button) => button.classList.toggle("active", next.includes(productId)));
}

function renderWishlistPanel() {
  const target = document.querySelector("[data-wishlist-panel]");
  if (!target) return;
  const items = wishlist().map(findProduct).filter(Boolean);
  target.innerHTML = items.length ? items.map(productCard).join("") : `<p class="empty">Your wishlist is ready for the pieces you love.</p>`;
}

function renderCart() {
  const list = document.querySelector("[data-cart-list]");
  const summary = document.querySelector("[data-cart-summary]");
  const items = cart();

  if (!items.length) {
    list.innerHTML = `<div class="empty-panel"><h2>Your cart is empty.</h2><a class="button gold" href="shop.html">Start Shopping</a></div>`;
    summary.innerHTML = "";
    return;
  }

  list.innerHTML = items.map((item, index) => {
    const product = findProduct(item.id);
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${item.size} / ${item.color}</p>
          <strong>${money.format(product.price)}</strong>
        </div>
        <div class="quantity-box compact"><button type="button" aria-label="Decrease quantity" data-cart-step="${index}" data-step="-1">${ICONS.minus}</button><input value="${item.qty}" aria-label="Quantity" readonly><button type="button" aria-label="Increase quantity" data-cart-step="${index}" data-step="1">${ICONS.plus}</button></div>
        <button class="button small" type="button" data-remove="${index}">Remove</button>
      </article>`;
  }).join("");

  list.querySelectorAll("[data-cart-step]").forEach((button) => button.addEventListener("click", () => updateCartQty(Number(button.dataset.cartStep), Number(button.dataset.step))));
  list.querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", () => removeCartItem(Number(button.dataset.remove))));
  renderSummary(summary, items, true);
}

function renderSummary(target, items, withCheckout) {
  const subtotal = items.reduce((sum, item) => sum + findProduct(item.id).price * item.qty, 0);
  const delivery = subtotal > 4999 ? 0 : DELIVERY_CHARGE;
  target.innerHTML = `
    <div class="summary-box">
      <h2>Order Summary</h2>
      <p><span>Subtotal</span><strong>${money.format(subtotal)}</strong></p>
      <p><span>Delivery</span><strong>${delivery ? money.format(delivery) : "Free"}</strong></p>
      <p class="total"><span>Total</span><strong>${money.format(subtotal + delivery)}</strong></p>
      ${withCheckout ? `<a class="button gold full" href="checkout.html">Proceed to Checkout</a>` : ""}
    </div>`;
}

function updateCartQty(index, step) {
  const items = cart();
  items[index].qty += step;
  if (items[index].qty < 1) items.splice(index, 1);
  writeStore("trl-cart", items);
  updateBadges();
  renderCart();
}

function removeCartItem(index) {
  const items = cart();
  items.splice(index, 1);
  writeStore("trl-cart", items);
  updateBadges();
  renderCart();
}

function renderCheckout() {
  const items = cart();
  const summary = document.querySelector("[data-checkout-summary]");
  const form = document.querySelector("[data-checkout-form]");
  if (!items.length) {
    summary.innerHTML = `<div class="empty-panel"><h2>No items to checkout.</h2><a class="button gold" href="shop.html">Shop Collection</a></div>`;
    form.classList.add("disabled");
    return;
  }
  renderSummary(summary, items, false);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const lines = items.map((item) => {
      const product = findProduct(item.id);
      return `${product.name} - ${item.size}/${item.color} x ${item.qty} = ${money.format(product.price * item.qty)}`;
    }).join("\n");
    const subject = encodeURIComponent(`New order from ${data.name}`);
    const body = encodeURIComponent(`Customer: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
Address: ${data.address}, ${data.city}, ${data.pincode}
Payment: ${data.payment}

Order:
${lines}`);
    localStorage.removeItem("trl-cart");
    updateBadges();
    document.querySelector("[data-order-success]").hidden = false;
    location.href = `mailto:${STORE_EMAIL}?subject=${subject}&body=${body}`;
  });
}

function openQuickView(productId) {
  const product = findProduct(productId);
  let modal = document.querySelector("[data-modal]");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.dataset.modal = "";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-backdrop" data-close-modal></div>
    <article class="quick-view">
      <button class="icon-button modal-close" type="button" data-close-modal aria-label="Close" title="Close">${ICONS.close}</button>
      <img src="${product.image}" alt="${product.name}">
      <div>
        <p class="eyebrow">${product.category}</p>
        <h2>${product.name}</h2>
        <div class="price-row large"><strong>${money.format(product.price)}</strong><del>${money.format(product.originalPrice)}</del></div>
        <p>${product.description}</p>
        <div class="modal-actions">
          <a class="button" href="product.html?id=${product.id}">View Details</a>
          <button class="button gold" type="button" data-add-cart="${product.id}">${ICONS.bag}<span>Add to Cart</span></button>
        </div>
      </div>
    </article>`;
  modal.classList.add("open");
  modal.querySelectorAll("[data-close-modal]").forEach((item) => item.addEventListener("click", () => modal.classList.remove("open")));
}

function bindContact() {
  document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const subject = encodeURIComponent(`Website enquiry from ${data.name}`);
    const body = encodeURIComponent(`${data.message}\n\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}`);
    location.href = `mailto:info@therichlook.in?subject=${subject}&body=${body}`;
    toast("Opening your email app.");
  });
}

function updateBadges() {
  const cartCount = cart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((item) => item.textContent = cartCount);
  document.querySelectorAll("[data-wishlist-count]").forEach((item) => item.textContent = wishlist().length);
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("trl-theme", next);
}

function toast(message) {
  const note = document.createElement("div");
  note.className = "toast";
  note.textContent = message;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 2200);
}

function markActiveNav() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-links] a").forEach((link) => {
    if (link.getAttribute("href") === current) link.setAttribute("aria-current", "page");
  });
}

function injectStructuredData() {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: BRAND.name,
    slogan: BRAND.tagline,
    telephone: [BRAND.phonePrimary, BRAND.phoneSecondary],
    address: BRAND.address,
    url: location.origin + location.pathname,
    sameAs: ["https://www.instagram.com/therichlook_24/"]
  });
  document.head.appendChild(script);
}

function injectProductSchema(product) {
  const existingScript = document.querySelector("script[data-product-schema]");
  if (existingScript) existingScript.remove();
  
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.productSchema = "true";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.gallery,
    brand: { "@type": "Brand", name: BRAND.name },
    offers: {
      "@type": "Offer",
      url: location.href,
      priceCurrency: "INR",
      price: product.price.toString(),
      priceValidUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock"
    },
    category: product.category
  });
  document.head.appendChild(script);
}

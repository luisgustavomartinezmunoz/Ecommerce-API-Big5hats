// Lógica del carrito mejorada con promos, modal y país lógico
(function () {
  const CART_KEY = 'big5hats_cart';
  const PROMO_KEY = 'big5hats_promo';

  const PROMOS = {
    WELCOME10: { code: 'WELCOME10', type: 'percentage', value: 10, active: true, expires: '2099-12-31' },
    VERANO50: { code: 'VERANO50', type: 'fixed', value: 50, active: true, expires: '2099-12-31' },
    FREESHIPMX: { code: 'FREESHIPMX', type: 'shipping', value: 0, active: true, expires: '2099-12-31', countries: ['MX'] },
    STUDENT15: { code: 'STUDENT15', type: 'percentage', value: 15, active: true, expires: '2099-12-31' },
    HIM20: { code: 'HIM20', type: 'percentage', value: 20, active: true, expires: '2099-12-31' },
    NAVIDAD100: { code: 'NAVIDAD100', type: 'fixed', value: 100, active: true, expires: '2099-12-31' }
  };

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error leyendo carrito', e);
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (typeof window.updateCartBadge === 'function') window.updateCartBadge();
  }

  function getAppliedPromo() {
    try {
      const raw = localStorage.getItem(PROMO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function setAppliedPromo(obj) {
    if (!obj) { localStorage.removeItem(PROMO_KEY); return; }
    localStorage.setItem(PROMO_KEY, JSON.stringify(obj));
  }

  function currency(v) {
    return '$' + Number(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
  }

  function getCountryOption() {
    const select = document.getElementById('countrySelect');
    return select?.selectedOptions?.[0] || null;
  }

  function renderCartItems() {
    const container = document.getElementById('cartItems');
    const cart = readCart();
    if (!container) return;
    if (!cart.length) {
      container.innerHTML = '<p class="muted">Tu carrito está vacío. Agrega productos desde la tienda.</p>';
      updateSummary();
      return;
    }

    const opt = getCountryOption();
    const mult = opt ? Number(opt.dataset.mult || 1) : 1;

    const table = document.createElement('div');
    table.style.display = 'grid';
    table.style.gap = '12px';

    cart.forEach((it) => {
      const row = document.createElement('div');
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '1fr 140px';
      row.style.alignItems = 'center';
      row.style.gap = '10px';
      row.style.borderBottom = '1px solid var(--border)';
      row.style.padding = '10px 0';

      const unitPrice = (Number(it.precio) || 0) * mult;
      const left = document.createElement('div');
      left.innerHTML = `<div style="font-weight:800">${it.nombre}</div><div style="color:var(--muted); font-size:13px">Precio unitario: ${currency(unitPrice)}</div>`;

      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.flexDirection = 'column';
      right.style.alignItems = 'flex-end';
      right.style.gap = '6px';

      const qtyWrap = document.createElement('div');
      qtyWrap.style.display = 'flex';
      qtyWrap.style.alignItems = 'center';
      qtyWrap.style.gap = '6px';

      const btnDec = document.createElement('button');
      btnDec.className = 'btn ghost';
      btnDec.textContent = '-';
      btnDec.style.padding = '6px 8px';
      btnDec.addEventListener('click', () => changeQty(it.id, -1));

      const spanQty = document.createElement('span');
      spanQty.textContent = it.cantidad;
      spanQty.style.minWidth = '28px';
      spanQty.style.textAlign = 'center';
      spanQty.style.fontWeight = '800';

      const btnInc = document.createElement('button');
      btnInc.className = 'btn';
      btnInc.textContent = '+';
      btnInc.style.padding = '6px 8px';
      btnInc.addEventListener('click', () => changeQty(it.id, 1));

      qtyWrap.appendChild(btnDec);
      qtyWrap.appendChild(spanQty);
      qtyWrap.appendChild(btnInc);

      const subtotal = document.createElement('div');
      subtotal.style.fontWeight = '800';
      subtotal.textContent = currency(unitPrice * (Number(it.cantidad) || 0));

      const remove = document.createElement('button');
      remove.className = 'btn ghost';
      remove.textContent = 'Eliminar';
      remove.addEventListener('click', () => removeItem(it.id));

      right.appendChild(qtyWrap);
      right.appendChild(subtotal);
      right.appendChild(remove);

      row.appendChild(left);
      row.appendChild(right);
      table.appendChild(row);
    });

    container.innerHTML = '';
    container.appendChild(table);
    updateSummary();
  }

  function changeQty(id, delta) {
    const cart = readCart();
    const it = cart.find((x) => x.id === id);
    if (!it) return;
    it.cantidad = Math.max(0, (Number(it.cantidad) || 0) + delta);
    const newCart = cart.filter((x) => x.cantidad > 0);
    writeCart(newCart);
    renderCartItems();
  }

  function removeItem(id) {
    const cart = readCart();
    const newCart = cart.filter((x) => x.id !== id);
    writeCart(newCart);
    renderCartItems();
  }

  function validatePromo(code) {
    if (!code) return { ok: false, msg: 'Ingrese un código.' };
    const up = code.trim().toUpperCase();
    const p = PROMOS[up];
    if (!p) return { ok: false, msg: 'El código no existe.' };
    if (!p.active) return { ok: false, msg: 'El código no está activo.' };
    if (p.expires && new Date(p.expires) < new Date()) return { ok: false, msg: 'El código está caducado.' };
    return { ok: true, promo: p };
  }

  function computeTotals(countryCode, couponObj) {
    const cart = readCart();
    const opt = getCountryOption();
    const mult = opt ? Number(opt.dataset.mult || 1) : 1;
    const taxRate = opt ? Number(opt.dataset.tax || 0) : 0;
    let shipping = opt ? Number(opt.dataset.ship || 0) : 0;

    const subtotalRaw = cart.reduce((s, it) => s + (Number(it.precio) || 0) * (Number(it.cantidad) || 0), 0);
    const subtotal = subtotalRaw * mult;
    const tax = subtotal * taxRate;

    let discount = 0;
    const applied = getAppliedPromo();
    if (applied) {
      const code = applied.code;
      const p = PROMOS[code];
      if (p) {
        if (p.type === 'percentage') discount = subtotal * (p.value / 100);
        else if (p.type === 'fixed') discount = p.value;
        else if (p.type === 'shipping') {
          if (!p.countries || p.countries.includes(opt?.value || '')) {
            shipping = 0;
          }
        }
      }
    }

    const total = Math.max(0, subtotal + tax + shipping - discount);
    return { subtotal, tax, shipping, discount, total };
  }

  function showCouponMessage(html, kind = 'info') {
    const el = document.getElementById('couponMessage');
    if (!el) return;
    el.innerHTML = `<div class="auth-status ${kind}">${html}</div>`;
  }

  function updateSummary() {
    const { subtotal, tax, shipping, discount, total } = computeTotals();
    document.getElementById('sumSubtotal').textContent = currency(subtotal);
    document.getElementById('sumTax').textContent = currency(tax);
    document.getElementById('sumShipping').textContent = currency(shipping);
    document.getElementById('sumTotal').textContent = currency(total);
  }

  // Apply coupon button
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'applyCoupon') {
      e.preventDefault();
      const raw = document.getElementById('couponInput')?.value || '';
      const res = validatePromo(raw);
      if (!res.ok) {
        showCouponMessage(res.msg, 'error');
        return;
      }
      const applied = getAppliedPromo();
      if (applied && applied.code === res.promo.code) {
        showCouponMessage('El código ya fue aplicado.', 'error');
        return;
      }
      setAppliedPromo({ code: res.promo.code });
      showCouponMessage(`Cupón <strong>${res.promo.code}</strong> aplicado.`, 'success');
      updateSummary();
    }
  });

  // Country change
  const country = document.getElementById('countrySelect');
  if (country) {
    country.addEventListener('change', () => {
      // Clear shipping-only promo if not applicable
      const applied = getAppliedPromo();
      if (applied && PROMOS[applied.code].type === 'shipping') {
        const p = PROMOS[applied.code];
        if (p.countries && !p.countries.includes(country.value)) {
          setAppliedPromo(null);
          showCouponMessage('El cupón de envío no aplica para el país seleccionado.', 'error');
        }
      }
      renderCartItems();
    });
  }

  // Render payment fields
  function renderPaymentFields() {
    const p = document.querySelector('input[name="payMethod"]:checked')?.value || 'card';
    const container = document.getElementById('paymentFields');
    if (!container) return;
    container.innerHTML = '';
    if (p === 'card') {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <input id="cardNumber" placeholder="Número de tarjeta" />
          <div style="display:flex; gap:8px;"><input id="cardExpiry" placeholder="MM/AA" /><input id="cardCvv" placeholder="CVV" style="width:120px" /></div>
          <input id="cardHolder" placeholder="Nombre del titular" />
        </div>
      `;
    } else if (p === 'transfer') {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div class="muted">Instrucciones (simulación): Transferencia a cuenta 123456789, banco DemoBank.</div>
          <input id="transferRef" placeholder="Referencia (simulada)" />
        </div>
      `;
    } else if (p === 'oxxo') {
      const ref = 'OX' + Math.random().toString(36).slice(2, 10).toUpperCase();
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div class="muted">Presenta este código en Oxxo para completar el pago (simulado).</div>
          <div style="font-weight:900; background:rgba(255,255,255,0.03); padding:8px; border-radius:8px;">Referencia: ${ref}</div>
        </div>
      `;
    }
  }

  document.addEventListener('change', (e) => {
    if (e.target && e.target.name === 'payMethod') renderPaymentFields();
  });

  // Modal UI
  function createModal() {
    if (document.getElementById('purchaseModal')) return;
    const modal = document.createElement('div');
    modal.id = 'purchaseModal';
    modal.className = 'auth-modal';
    modal.innerHTML = `<div class="auth-modal-box" role="dialog" aria-modal="true" style="max-width:640px;">
      <div style="display:flex; flex-direction:column; gap:12px; color:#0b0c10; background:linear-gradient(180deg,#fff,#f7f5f0); padding:18px; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;"><h3 style="margin:0;">Pago</h3><button id="closeModal" class="btn ghost">Cerrar</button></div>
        <div id="modalContent" style="background:transparent;"></div>
      </div>
    </div>`;
    document.body.appendChild(modal);
    document.getElementById('closeModal').addEventListener('click', hideModal);
  }

  function showModal(html) {
    createModal();
    const modal = document.getElementById('purchaseModal');
    const content = document.getElementById('modalContent');
    if (content) content.innerHTML = html;
    modal.classList.add('show');
    modal.style.pointerEvents = 'all';
  }

  function hideModal() {
    const modal = document.getElementById('purchaseModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }

  // Checkout simulator (más estético)
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.textContent = 'Proceso de pago';
    checkoutBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const cart = readCart();
      if (!cart.length) {
        if (typeof window.showNotice === 'function') window.showNotice('Tu carrito está vacío.', 'error');
        return;
      }
      // Validar datos de envío
      const name = document.getElementById('shipName')?.value?.trim();
      const addr = document.getElementById('shipAddress')?.value?.trim();
      const city = document.getElementById('shipCity')?.value?.trim();
      const zip = document.getElementById('shipZip')?.value?.trim();
      const phone = document.getElementById('shipPhone')?.value?.trim();
      if (!name || !addr || !city || !zip || !phone) {
        if (typeof window.showNotice === 'function') window.showNotice('Completa todos los datos de envío.', 'error');
        return;
      }

      const opt = getCountryOption();
      const countrySel = opt ? opt.textContent : '';
      const totals = computeTotals();
      const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'card';

      const applied = getAppliedPromo();
      const promoHtml = applied ? `<div style="font-size:13px;color:var(--muted)">Cupón: <strong>${applied.code}</strong></div>` : '';

      const cartHtml = readCart().map(it => `<div style="display:flex; justify-content:space-between; margin:6px 0;"><div>${it.nombre} x ${it.cantidad}</div><div style="font-weight:900">${currency(((Number(it.precio)||0)* (Number(opt?.dataset.mult||1))) * Number(it.cantidad))}</div></div>`).join('');

      const html = `
        <div>
          <h4 style="margin-top:0;">Gracias por tu compra</h4>
          <p class="muted">Este es un pago simulado. No se realizará ningún cargo.</p>
          <div style="margin-top:12px; border-top:1px solid var(--border); padding-top:10px;">
            ${cartHtml}
            <div style="display:flex; justify-content:space-between; margin-top:8px;"><strong>Subtotal</strong><div>${currency(totals.subtotal)}</div></div>
            <div style="display:flex; justify-content:space-between;"><strong>Impuestos</strong><div>${currency(totals.tax)}</div></div>
            <div style="display:flex; justify-content:space-between;"><strong>Envío</strong><div>${currency(totals.shipping)}</div></div>
            ${promoHtml}
            <div style="display:flex; justify-content:space-between; margin-top:8px;"><strong>Total</strong><div style="font-weight:900">${currency(totals.total)}</div></div>
          </div>
          <div style="margin-top:12px; font-size:13px; color:var(--muted)">Simulación: No se ha procesado ningún pago.</div>
        </div>
      `;

      showModal(html);
      if (typeof window.showNotice === 'function') window.showNotice('Pago simulado realizado. Gracias.', 'success');
      // Vaciar carrito tras simulación
      writeCart([]);
      renderCartItems();
    });
  }

  // Inicial
  renderCartItems();
  renderPaymentFields();
})();

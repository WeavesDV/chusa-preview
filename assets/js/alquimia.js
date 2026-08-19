document.querySelectorAll('.nav-toggle').forEach((button) => {
  const nav = document.getElementById(button.getAttribute('aria-controls'));
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav.dataset.open = String(!open);
    button.querySelector('.nav-label').textContent = open ? 'Abrir menú' : 'Cerrar menú';
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      button.click(); button.focus();
    }
  });
});

document.querySelectorAll('form[data-demo]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = form.querySelector('.form-message');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (message) { message.dataset.visible = 'true'; message.setAttribute('tabindex', '-1'); message.focus(); }
  });
});

/* Alta en la lista de correo.
   El endpoint vive en la app de Next (/acciones/suscribir), que es quien
   guarda la clave de MailerLite. Abriendo el HTML como fichero suelto no hay
   servidor y el envio falla: por eso siempre se avisa en pantalla. */
window.suscribir = async function (datos) {
  const respuesta = await fetch('/acciones/suscribir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || 'No hemos podido registrarte.');
  return cuerpo;
};

/* Formularios de suscripcion. El valor de data-suscribir es el origen que se
   guarda en MailerLite, para saber por que puerta entro cada contacto. */
document.querySelectorAll('form[data-suscribir]').forEach((form) => {
  const exito = form.querySelector('.form-message--success');
  const fallo = form.querySelector('.form-message--error');
  const boton = form.querySelector('button');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    [exito, fallo].forEach((aviso) => { if (aviso) aviso.dataset.visible = 'false'; });
    if (boton) { boton.disabled = true; }

    try {
      await window.suscribir({
        nombre: form.querySelector('input[autocomplete="name"]')?.value ?? '',
        email: form.querySelector('input[type="email"]')?.value ?? '',
        consentimiento: form.querySelector('input[type="checkbox"]')?.checked === true,
        origen: form.dataset.suscribir,
      });
      if (exito) { exito.dataset.visible = 'true'; exito.setAttribute('tabindex', '-1'); exito.focus(); }
      form.reset();
    } catch (error) {
      if (fallo) { fallo.textContent = error.message; fallo.dataset.visible = 'true'; fallo.setAttribute('tabindex', '-1'); fallo.focus(); }
    } finally {
      if (boton) { boton.disabled = false; }
    }
  });
});

/* Revelado al hacer scroll — mismo mecanismo y curva que el home.
   El home trae su propio PLAN inline y ya marca .has-anim antes de cargar
   este fichero, asi que ahi salimos sin tocar nada. */
(function () {
  var root = document.documentElement;
  if (root.classList.contains('has-anim')) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  // [selector, paso de stagger entre hermanos, retardo base]
  var PLAN = [
    ['.page-hero .eyebrow',            0,    80],
    ['.page-hero h1',                  0,   180],
    ['.page-hero__lead',               0,   320],
    ['.page-hero .actions',            0,   440],
    ['.hero-speaking__panel > *',      90,   120],
    ['.pillar',                        110,  260],
    ['.badge-row',                     0,     0],
    ['.section__head > *',             100,   0],
    ['.page-hero__grid > *',           140,   0],
    ['.split-grid > *',                140,   0],
    ['.feature-list li',                90,   0],
    ['.quote',                         0,     0],
    ['.timeline__item',                100,   0],
    ['.impact-step',                   90,    0],
    ['.pain-card',                     100,   0],
    ['.course-card',                   120,   0],
    ['.course-step',                    90,   0],
    ['.fit-panel',                     120,   0],
    ['.equipos-panel > *',             140,   0],
    ['.form-split > *',                120,   0],
    ['.service-card',                  100,   0],
    ['.service-detail-card',           0,     0],
    ['.faq__item',                     70,    0],
    ['.form-shell, .contact-form, .lead-form', 0, 0],
    ['.cta-band__inner > *',           120,   0]
  ];

  var targets = [];
  PLAN.forEach(function (rule) {
    var counters = new Map();
    document.querySelectorAll(rule[0]).forEach(function (el) {
      if (el.hasAttribute('data-anim')) return;     // una sola regla por elemento
      var i = counters.get(el.parentNode) || 0;     // el stagger cuenta por padre
      counters.set(el.parentNode, i + 1);
      el.setAttribute('data-anim', '');
      el.style.setProperty('--anim-delay', (rule[2] + i * rule[1]) + 'ms');
      targets.push(el);
    });
  });
  if (!targets.length) return;

  root.classList.add('has-anim');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);                   // se revela una vez, no en bucle
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      targets.forEach(function (el) {
        // lo que ya esta en pantalla al cargar entra solo, sin esperar scroll
        if (el.closest('.page-hero, .hero-speaking')) el.classList.add('is-in');
        else io.observe(el);
      });
    });
  });
})();

document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Branding: anteúltima letra de cada palabra en naranja ----------
// Se aplica a todos los títulos blancos (h2/h3) del sitio, menos el nombre
// "Diego de la Peña." (nav + hero + footer), que ya tiene su propio tratamiento.
(function accentPenultimateLetters() {
  const WORD_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]+/g;

  document.querySelectorAll("h2, h3").forEach((el) => {
    if (el.closest(".hero-name, .brand")) return;

    const text = el.textContent;
    let html = "";
    let lastIndex = 0;
    let match;

    while ((match = WORD_RE.exec(text)) !== null) {
      html += text.slice(lastIndex, match.index);
      const word = match[0];
      if (word.length >= 2) {
        const i = word.length - 2;
        html += word.slice(0, i) + '<span class="accent-letter">' + word[i] + "</span>" + word.slice(i + 1);
      } else {
        html += word;
      }
      lastIndex = match.index + word.length;
    }
    html += text.slice(lastIndex);

    el.innerHTML = html;
  });
})();

const toggle = document.getElementById("nav-toggle");
const nav = document.getElementById("main-nav");

toggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- Modal de contacto ----------
// Completar con la URL que da Formspree (ej: "https://formspree.io/f/xxxxxxx")
// una vez creada la cuenta. Mientras esté vacío, el form cae de vuelta a un mailto.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqernkzl";
const CONTACT_EMAIL = "diego.edson.delapena@gmail.com";

const modal = document.getElementById("contact-modal");
const modalClose = document.getElementById("contact-modal-close");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("contact-form-status");
const submitBtn = document.getElementById("contact-form-submit");

function openContactModal() {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("cf-email").focus();
}

function closeContactModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-open-contact]").forEach((btn) => {
  btn.addEventListener("click", openContactModal);
});

modalClose.addEventListener("click", closeContactModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeContactModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeContactModal();
});

function buildMailto(data) {
  const subject = encodeURIComponent(`Proyecto: ${data.project}`);
  const body = encodeURIComponent(
    `Nombre: ${data.name}\nMail: ${data.email}\nTeléfono: ${data.phone || "-"}\n\n${data.message}`
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    email: document.getElementById("cf-email").value.trim(),
    name: document.getElementById("cf-name").value.trim(),
    phone: document.getElementById("cf-phone").value.trim(),
    project: document.getElementById("cf-project").value.trim(),
    message: document.getElementById("cf-message").value.trim(),
  };

  if (!FORMSPREE_ENDPOINT) {
    window.location.href = buildMailto(data);
    return;
  }

  submitBtn.disabled = true;
  formStatus.textContent = "Enviando...";
  formStatus.className = "modal-status";

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(contactForm),
    });
    if (res.ok) {
      formStatus.textContent = "¡Listo! Te voy a estar respondiendo pronto.";
      formStatus.classList.add("is-success");
      contactForm.reset();
      setTimeout(closeContactModal, 2200);
    } else {
      throw new Error("bad status");
    }
  } catch (err) {
    formStatus.textContent = "No se pudo enviar automáticamente. Abriendo tu mail...";
    formStatus.classList.add("is-error");
    setTimeout(() => {
      window.location.href = buildMailto(data);
    }, 1200);
  } finally {
    submitBtn.disabled = false;
  }
});

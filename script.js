const CRIME_DATA_2024 = [
  { name: 'Мошенничества', count: 45156, share: 34.0, group: 'property', note: 'Наиболее распространенный вид правонарушений' },
  { name: 'Кражи', count: 30593, share: 23.0, group: 'property', note: 'Снижение на 28,3% к 2023 году' },
  { name: 'Наркопреступления', count: 8363, share: 6.3, group: 'public', note: 'Официальный учет КПСиСУ ГП РК' },
  { name: 'Хулиганства', count: 1615, share: 1.2, group: 'public', note: 'Официальный учет КПСиСУ ГП РК' },
  { name: 'Грабежи', count: 1551, share: 1.2, group: 'property', note: 'Официальный учет КПСиСУ ГП РК' },
  { name: 'Скотокрадство', count: 1051, share: 0.8, group: 'property', note: 'Официальный учет КПСиСУ ГП РК' },
  { name: 'Убийства', count: 566, share: 0.4, group: 'public', note: 'Официальный учет КПСиСУ ГП РК' },
  { name: 'Изнасилования', count: 421, share: 0.3, group: 'public', note: 'Официальный учет КПСиСУ ГП РК' },
  { name: 'Прочие правонарушения', count: 43462, share: 32.7, group: 'other', note: 'Иные составы УК РК' }
];

const OFFICIAL_TOTAL_2024 = 132778;

document.addEventListener('DOMContentLoaded', () => {
  const formatNumber = (n) => new Intl.NumberFormat('ru-RU').format(n);

  // Mobile navigation toggle
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      primaryNav.classList.toggle('is-open', !expanded);
    });

    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('is-open');
      });
    });
  }

  // Session-only accessible theme toggle (no persistent storage)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isDark = prefersDark;
    const syncThemeButton = () => {
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
    };
    syncThemeButton();

    themeToggle.addEventListener('click', () => {
      isDark = !isDark;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      syncThemeButton();
    });
  }

  // Section 3: Filter, sort & visual bar chart
  const groupFilter = document.getElementById('stats-group-filter');
  const sortSelect = document.getElementById('stats-sort');
  const tableBody = document.getElementById('stats-table-body');
  const chartContainer = document.getElementById('stats-chart');

  function renderStatistics() {
    const selectedGroup = groupFilter.value;
    const sortDir = sortSelect.value;

    const filtered = CRIME_DATA_2024
      .filter((item) => selectedGroup === 'all' || item.group === selectedGroup)
      .sort((a, b) => (sortDir === 'desc' ? b.count - a.count : a.count - b.count));

    tableBody.innerHTML = filtered
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${formatNumber(item.count)}</td>
            <td>${item.share.toFixed(1).replace('.', ',')}%</td>
            <td>${item.note}</td>
          </tr>
        `
      )
      .join('');

    const maxShare = Math.max(...filtered.map((item) => item.share), 1);
    chartContainer.innerHTML = filtered
      .map((item) => {
        const barWidth = Math.max((item.share / maxShare) * 100, 1.5);
        return `
          <div class="bar-row" role="listitem">
            <span>${item.name}</span>
            <span class="bar-val">${item.share.toFixed(1).replace('.', ',')}%</span>
            <div class="bar-track" aria-hidden="true">
              <div class="bar-fill" style="width: ${barWidth.toFixed(1)}%"></div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  groupFilter.addEventListener('change', renderStatistics);
  sortSelect.addEventListener('change', renderStatistics);
  renderStatistics();

  // Section 4: Calculator & Classifier
  const baseInput = document.getElementById('base-count');
  const currInput = document.getElementById('curr-count');
  const rateBox = document.getElementById('rate-result');
  const btnRate = document.getElementById('btn-calc-rate');

  const guiltSelect = document.getElementById('guilt-type');
  const termInput = document.getElementById('term-years');
  const lifeCheck = document.getElementById('is-life');
  const catBox = document.getElementById('cat-result');
  const btnCat = document.getElementById('btn-calc-cat');

  function calculateDynamics() {
    const rawBase = baseInput.value.trim();
    const rawCurr = currInput.value.trim();

    if (rawBase === '' || rawCurr === '') {
      rateBox.classList.add('is-error');
      rateBox.textContent = 'Ошибка ввода: заполните оба поля для расчета динамики.';
      return;
    }

    const base = Number(rawBase);
    const curr = Number(rawCurr);

    if (!Number.isFinite(base) || !Number.isFinite(curr) || base < 0 || curr < 0) {
      rateBox.classList.add('is-error');
      rateBox.textContent = 'Ошибка ввода: количество правонарушений не может быть отрицательным.';
      return;
    }

    rateBox.classList.remove('is-error');
    const diff = curr - base;
    const sign = diff > 0 ? '+' : '';
    const shareOf2024 = ((curr / OFFICIAL_TOTAL_2024) * 100).toFixed(1).replace('.', ',');

    if (base === 0) {
      rateBox.innerHTML =
        `<strong>Абсолютное изменение:</strong> ${sign}${formatNumber(diff)} ед.<br>` +
        `<strong>Относительный темп:</strong> не вычисляется (базовый показатель равен 0; деление на 0 исключено).<br>` +
        `<strong>Справочно:</strong> отчетное значение составляет ${shareOf2024}% от общего числа по РК в 2024 г. (132 778).`;
      return;
    }

    const pct = (diff / base) * 100;
    const trend = diff < 0 ? 'Снижение' : diff > 0 ? 'Рост' : 'Без изменений';
    rateBox.innerHTML =
      `<strong>Тенденция:</strong> ${trend}<br>` +
      `<strong>Абсолютное изменение:</strong> ${sign}${formatNumber(diff)} правонарушений<br>` +
      `<strong>Темп изменения:</strong> ${sign}${pct.toFixed(1).replace('.', ',')}%<br>` +
      `<strong>Доля от уровня 2024 г. (132 778):</strong> ${shareOf2024}%`;
  }

  function classifySeverity() {
    const guilt = guiltSelect.value;
    const isLife = lifeCheck.checked;
    const rawYears = termInput.value.trim();

    if (isLife) {
      catBox.classList.remove('is-error');
      if (guilt === 'negligent') {
        catBox.classList.add('is-error');
        catBox.textContent =
          'Несоответствие норме: по ч. 5 ст. 11 УК РК пожизненное лишение свободы относится только к умышленным особо тяжким преступлениям.';
        return;
      }
      catBox.innerHTML =
        `<strong>Категория:</strong> Особо тяжкое преступление (ч. 5 ст. 11 УК РК)<br>` +
        `<strong>Основание:</strong> предусмотрено пожизненное лишение свободы.<br>` +
        `<em>Справочно для статистического учета; не является индивидуальной квалификацией.</em>`;
      return;
    }

    if (rawYears === '') {
      catBox.classList.add('is-error');
      catBox.textContent = 'Ошибка ввода: укажите максимальный срок лишения свободы в годах (или 0, если лишение свободы не предусмотрено).';
      return;
    }

    const years = Number(rawYears);
    if (!Number.isFinite(years) || years < 0 || years > 30) {
      catBox.classList.add('is-error');
      catBox.textContent = 'Граничное значение вне диапазона: укажите срок от 0 до 30 лет.';
      return;
    }

    catBox.classList.remove('is-error');

    if (years === 0) {
      catBox.innerHTML =
        `<strong>Статус:</strong> Лишение свободы не предусмотрено (срок = 0 лет)<br>` +
        `<strong>Справка по ст. 10 УК РК:</strong> деяние может относиться к уголовным проступкам или преступлениям без лишения свободы (штраф, исправительные/общественные работы и др.).`;
      return;
    }

    let category = '';
    let basis = '';

    if (guilt === 'intentional') {
      if (years <= 2) {
        category = 'Преступление небольшой тяжести';
        basis = 'ч. 2 ст. 11 УК РК (умышленное, до 2 лет включительно)';
      } else if (years <= 5) {
        category = 'Преступление средней тяжести';
        basis = 'ч. 3 ст. 11 УК РК (умышленное, свыше 2 до 5 лет включительно)';
      } else if (years <= 12) {
        category = 'Тяжкое преступление';
        basis = 'ч. 4 ст. 11 УК РК (умышленное, свыше 5 до 12 лет включительно)';
      } else {
        category = 'Особо тяжкое преступление';
        basis = 'ч. 5 ст. 11 УК РК (умышленное, свыше 12 лет)';
      }
    } else {
      if (years <= 5) {
        category = 'Преступление небольшой тяжести';
        basis = 'ч. 2 ст. 11 УК РК (неосторожное, до 5 лет включительно)';
      } else {
        category = 'Преступление средней тяжести';
        basis = 'ч. 3 ст. 11 УК РК (неосторожное, свыше 5 лет; тяжких и особо тяжких по неосторожности нет)';
      }
    }

    catBox.innerHTML =
      `<strong>Категория:</strong> ${category}<br>` +
      `<strong>Норма:</strong> ${basis}<br>` +
      `<em>Справочно для статистического учета; не является индивидуальной квалификацией.</em>`;
  }

  lifeCheck.addEventListener('change', () => {
    termInput.disabled = lifeCheck.checked;
    classifySeverity();
  });

  btnRate.addEventListener('click', calculateDynamics);
  btnCat.addEventListener('click', classifySeverity);

  [baseInput, currInput].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') calculateDynamics();
    });
  });

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') classifySeverity();
  });

  document.querySelectorAll('.btn-chip[data-base]').forEach((btn) => {
    btn.addEventListener('click', () => {
      baseInput.value = btn.dataset.base;
      currInput.value = btn.dataset.curr;
      calculateDynamics();
    });
  });

  document.querySelectorAll('.term-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      guiltSelect.value = btn.dataset.guilt;
      termInput.value = btn.dataset.years;
      lifeCheck.checked = false;
      termInput.disabled = false;
      classifySeverity();
    });
  });

  // Section 5: Verification table quick search
  const verifySearch = document.getElementById('verify-search');
  const verifyBody = document.getElementById('verify-table-body');
  if (verifySearch && verifyBody) {
    const rows = Array.from(verifyBody.querySelectorAll('tr'));
    verifySearch.addEventListener('input', () => {
      const q = verifySearch.value.trim().toLowerCase();
      rows.forEach((row) => {
        const match = row.textContent.toLowerCase().includes(q);
        row.hidden = !match;
      });
    });
  }
});

// Global Roster Variables
let rosterMembers = [];
let streamerMembers = [];
let featuredStreamerIndex = 0;
let activeVersion = 'v1';
let activeRoleFilter = 'ALL';

let tapCount = 0;
let tapTimer;

const logo = document.querySelector('.logo-button');

if (logo) {
  logo.addEventListener('click', () => {
    tapCount++;

    clearTimeout(tapTimer);

    tapTimer = setTimeout(() => {
      tapCount = 0;
    }, 1200);

    if (tapCount === 5) {
      window.location.href = './Admin/login.html';
      tapCount = 0;
    }
  });
}

// Official Management List (Exclusive to Leadership Carousel & Admin checks)
const managementList = [
  { ign: 'RAYA', role: 'Founder', version: 'v1' },
  { ign: 'AVA', role: 'Co-Founder', version: 'v1' },
  { ign: 'NALA', role: 'Co-Founder', version: 'v1' },
  { ign: 'YAJ', role: 'Head Disciplinary', version: 'v1' },
  { ign: 'KIRAA', role: 'Disciplinary', version: 'v2' },
  { ign: 'LUWI', role: 'Head Admin', version: 'v1' },
  { ign: 'WUSHI', role: 'Head Admin', version: 'v2' },
  { ign: 'PIA', role: 'Admin', version: 'v1' },
  { ign: 'LY', role: 'Admin', version: 'v1' },
  { ign: 'KYOUKA', role: 'Admin', version: 'v1' },
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Main Roster Data (Strips management from public lists)
  initData();

  // 2. Initialize Leadership Carousel (Hooks into static HTML slides)
  initAboutCarousel();

  // 3. Search Input Listener
  const searchInput = document.getElementById('public-roster-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderRoster();
    });
  }

  renderStreamers();

  document.getElementById('streamer-prev')?.addEventListener('click', () => {
    updateFeaturedStreamer(featuredStreamerIndex - 1);
  });
  document.getElementById('streamer-next')?.addEventListener('click', () => {
    updateFeaturedStreamer(featuredStreamerIndex + 1);
  });

  // 4. Role Filter Buttons
  const filterBtns = document.querySelectorAll('.role-filter-bar .filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeRoleFilter = btn.getAttribute('data-role');
      renderRoster();
    });
  });
});

/* ==========================================================================
   1. Data Initialization & Filtering
   ========================================================================== */
function initData() {
  const adminNames = managementList.map((m) => m.ign.toLowerCase());

  const rawV1Streamers = [
    'Achlys',
    'Adiwiwo',
    'Aly',
    'Ash',
    'Ashèr',
    'Byowmi',
    'Carti',
    'Cooper',
    'Darco',
    'Dior Meow',
    'Dose',
    'Franz',
    'Goddess',
    'Ian',
    'Jinx',
    'Jo',
    'Kleb',
    'Kloud',
    'Klu',
    'Kumi',
    'Liwa',
    'Luwi',
    'Maeve',
    'Migo',
    'Migs',
    'Migs',
    'Moon',
    'Moshi',
    'Nawi',
    'Niyeon',
    'Raize',
    'Revv',
    'Senah',
    'Silent',
    'Spice',
    'Sutil',
    'Syke',
    'Thara',
    'Xanti',
    'Xenon',
    'Xyy',
    'Yezi',
    'Yzzi',
  ];
  const rawV1Members = [
    'Abed',
    'Adi',
    'Aji',
    'Akio',
    'Alas',
    'Arkaz',
    'Arthur',
    'Arv',
    'Asher',
    'Astra',
    'Atuko',
    'Auwdi',
    'Avo',
    'Ayu',
    'Aéia',
    'Bernyx',
    'Blu',
    'Blue',
    'Carlos',
    'Carti',
    'Ced',
    'Chami',
    'Ciam',
    'Corgi',
    'Cosmo',
    'Cosmos',
    'Cuervo',
    'Cyberr',
    'D_D',
    'Daikin',
    'Dawg',
    'Deni',
    'Dexuzz',
    'doc.ᴙ',
    'Donny',
    'Dos',
    'Drei',
    'Drizzy',
    'Eezy',
    'Eishi',
    'Eiya',
    'Elibz',
    'Elly',
    'Enoki',
    'Essa',
    'Faze',
    'Fika',
    'Flo',
    'Friox',
    'Gckfosu',
    'Genji',
    'Gia',
    'Gucci',
    'Hairyballz',
    'Haks',
    'Hans',
    'Hera',
    'Hero',
    'Hoón',
    'Iyahh',
    'J777',
    'Jaree',
    'Jas',
    'Jaxon',
    'Jeff',
    'Ji',
    'Jol',
    'Ju',
    'Junø',
    'Kaeklay',
    'Ken',
    'Kez',
    'Kia',
    'Kiel',
    'Kira',
    'Kiyo',
    'Kizenn',
    'Klit',
    'Kramm',
    'Kyo',
    'Kyo',
    'Kyosh',
    'Kyu',
    'Lai',
    'Lai',
    'Lason',
    'Lee',
    'Lek',
    'Ley',
    'Lowell',
    'Luwis',
    'Lux',
    'Marco',
    'Megumi',
    'Mei',
    'Mentos',
    'Min',
    'Mr.pres',
    'Nav',
    'Nayang',
    'Nero',
    'Nick',
    'Nini',
    'Oshot',
    'Owa',
    'Paul',
    'Potato',
    'Prada',
    'Primo',
    'Qui',
    'Quinc',
    'Rai',
    'Rai',
    'Reck',
    'Reelee',
    'Rei',
    'Renren',
    'Rex',
    'Ri',
    'Roué',
    'Ryzenn',
    'Sae',
    'Saint',
    'Salt',
    'Salty',
    'Seii',
    'Sheder',
    'Shi',
    'Shiy',
    'Shr1mp',
    'Shy',
    'Sigabo',
    'Sinigang',
    'Skye',
    'Skyee',
    'Skyflakes',
    'Snow',
    'So4p',
    'Sora',
    'Svel',
    'Sythe',
    'Syzioo',
    'Tannie',
    'Tensei',
    'Tlark',
    'Toji',
    'Tokyo',
    'Tram',
    'Trippzy',
    'Tyn',
    'Uno',
    'Usopp',
    'Val',
    'Val',
    'Vee',
    'Ven',
    'Vinx',
    'Violario',
    'Wang',
    'Wino',
    'Winter',
    'Xcyrasie',
    'Xery',
    'Xian',
    'Yan',
    'Yanny',
    'Yanzi',
    'Yogiee',
    'Yorts',
    'Yuwan',
    'Zaccxx',
    'Zai',
    'Zanjiee',
    'Zed',
    'Zein',
    'Zeji',
    'Zepp',
    'Ziku',
    'Zynkream',
  ];
  const rawV2Streamers = [
    'Baeshit',
    'Conan',
    'Cozl',
    'Ishi',
    'Kodi',
    'Leeyn',
    'Luv',
    'Maaii',
    'Nami',
    'Quin',
    'Reielle',
    'Renzo',
    'Riri',
    'Straw',
    'Syug',
    'Vin',
    'Yakult',
  ];
  const rawV2Members = [
    'Adi',
    'Adrienne',
    'Alex',
    'Arc',
    'Asta',
    'Baesic',
    'Bricks',
    'Caps',
    'Casper',
    'Cee',
    'Ceej',
    'Cent',
    'Cheri',
    'Choco',
    'Ckkpo',
    'Clio',
    'Cly',
    'Covy',
    'Cozy',
    'Croque',
    'Cruemel',
    'Dabi',
    'Dekuu',
    'Don',
    'Don',
    'Doz',
    'Dre',
    'Drei',
    'Dreiiian',
    'Echo',
    'Ence',
    'Ezio',
    'Ezxovar',
    'Fallen',
    'Fin',
    'Fiz',
    'Frae',
    'Frost',
    'Gio',
    'Gyu',
    'Haki',
    'Heassuu',
    'Horùs',
    'Hyuse',
    'Ian',
    'Ian',
    'Icarus',
    'Ishi',
    'J1ngpay',
    'Jackal',
    'Jacob',
    'Jelly',
    'Jms',
    'Jzen',
    'Kai',
    'Kel',
    'Ken',
    'Kenmo',
    'Kenzu',
    'Kesha',
    'Keytzu',
    'Kiomi',
    'Kisha',
    'Kyoshi',
    'Lens',
    'Limee',
    'Locco',
    'Lucy',
    'Mai',
    'Mat',
    'Maya',
    'Merxia',
    'Miles',
    'Mob',
    'N',
    'Nemi',
    'Nx',
    'Nóva',
    'Ponyo',
    'Prince',
    'Quanxi',
    'Rein',
    'Rein',
    'Renze',
    'Rex',
    'Russ',
    'Sac',
    'Sage',
    'Saye',
    'Shan',
    'Soul',
    'Sy',
    'Terkz',
    'Tevs',
    'Tine',
    'Tophh',
    'Toshsei',
    'Tress',
    'Vain',
    'Vani',
    'Vanta',
    'Vxlcia',
    'Wanjun',
    'Wiz',
    'Xui',
    'Yabai',
    'Yachty',
    'Yaku',
    'Yasu',
    'Yoda',
    'Yoshi',
    'Yra',
    'Yro',
    'Yuta',
    'Yuán',
    'Zach',
    'Zai',
    'Zen',
    'Zenitsu',
    'Zenn',
    'Zi',
    'Zi',
    'Zner',
    'Zyl',
    'Zyx',
    'Àyshi',
    '合成器',
    '张书耀',
  ];

  // Filter management names completely out of community lists
  const v1Streamers = rawV1Streamers.filter(
    (name) => !adminNames.includes(name.toLowerCase()),
  );
  const v1Members = rawV1Members.filter(
    (name) => !adminNames.includes(name.toLowerCase()),
  );
  const v2Streamers = rawV2Streamers.filter(
    (name) => !adminNames.includes(name.toLowerCase()),
  );
  const v2Members = rawV2Members.filter(
    (name) => !adminNames.includes(name.toLowerCase()),
  );

  const defaultStreamers = [
    ...v1Streamers.map((ign, index) => ({
      id: `v1-streamer-${index}`,
      ign,
      username: `@${ign.toLowerCase()}`,
      tiktokName: ign,
      following: 0,
      followers: 0,
      tiktokUrl: '',
      role: 'Streamer',
      version: 'v1',
      details: '',
      image: '',
    })),
    ...v2Streamers.map((ign, index) => ({
      id: `v2-streamer-${index}`,
      ign,
      username: `@${ign.toLowerCase()}`,
      tiktokName: ign,
      following: 0,
      followers: 0,
      tiktokUrl: '',
      role: 'Streamer',
      version: 'v2',
      details: '',
      image: '',
    })),
  ];
  const defaultRoster = [
    ...v1Members.map((ign) => ({ ign, role: 'Casual', version: 'v1' })),
    ...v2Members.map((ign) => ({ ign, role: 'Casual', version: 'v2' })),
  ];

  const savedRoster = localStorage.getItem('tk_roster');
  const savedStreamers = localStorage.getItem('tk_streamers');
  if (!savedRoster) {
    rosterMembers = defaultRoster;
    localStorage.setItem('tk_roster', JSON.stringify(defaultRoster));
  } else {
    try {
      const parsed = JSON.parse(savedRoster);
      rosterMembers = parsed.filter(
        (m) => !adminNames.includes((m.ign || '').toLowerCase()),
      );
      localStorage.setItem('tk_roster', JSON.stringify(rosterMembers));
    } catch (e) {
      rosterMembers = defaultRoster;
      localStorage.setItem('tk_roster', JSON.stringify(defaultRoster));
    }
  }

  if (!savedStreamers) {
    const legacyStreamers = rosterMembers.filter(
      (member) => member.role === 'Streamer',
    );
    streamerMembers = legacyStreamers.length
      ? legacyStreamers.map((member, index) => ({
          ...member,
          id: member.id || `streamer-${index}`,
          username: member.username || `@${member.ign.toLowerCase()}`,
          tiktokName: member.tiktokName || member.ign,
          following: member.following || 0,
          followers: member.followers || 0,
          tiktokUrl: member.tiktokUrl || '',
          details: member.details || '',
          image: member.image || '',
        }))
      : defaultStreamers;
    rosterMembers = rosterMembers.filter(
      (member) => member.role !== 'Streamer',
    );
    localStorage.setItem('tk_roster', JSON.stringify(rosterMembers));
    localStorage.setItem('tk_streamers', JSON.stringify(streamerMembers));
  } else {
    try {
      streamerMembers = JSON.parse(savedStreamers).map((streamer) => ({
        ...streamer,
        username: streamer.username || `@${streamer.ign.toLowerCase()}`,
        tiktokName: streamer.tiktokName || streamer.ign,
        following: streamer.following || 0,
        followers: streamer.followers || 0,
        tiktokUrl: streamer.tiktokUrl || '',
      }));
    } catch (e) {
      streamerMembers = defaultStreamers;
    }
  }

  renderRoster();
  renderStreamers();
}

window.addEventListener('storage', (event) => {
  if (event.key === 'tk_roster') {
    try {
      const adminNames = managementList.map((m) => m.ign.toLowerCase());
      const parsed = JSON.parse(event.newValue || '[]');
      rosterMembers = parsed.filter(
        (m) => !adminNames.includes((m.ign || '').toLowerCase()),
      );
    } catch (e) {
      rosterMembers = [];
    }
    renderRoster();
  }
  if (event.key === 'tk_streamers') {
    try {
      streamerMembers = JSON.parse(event.newValue || '[]');
    } catch (e) {
      streamerMembers = [];
    }
    renderStreamers();
  }
});

/* ==========================================================================
   2. Leadership Carousel Controller
   ========================================================================== */
function initAboutCarousel() {
  const track = document.getElementById('carouselTrack');
  const trackWrapper = track?.parentElement;
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track || !trackWrapper || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = Array.from(track.children);

  // Build pagination dots dynamically based on pre-rendered slides
  dotsContainer.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('data-index', index);
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);
  let currentIndex = 0;
  let autoSlideTimer = null;

  const updateCarousel = (index) => {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    const slideWidth = slides[0].offsetWidth;
    const trackGap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const centerOffset = (trackWrapper.clientWidth - slideWidth) / 2;
    const slideOffset = currentIndex * (slideWidth + trackGap);

    track.style.transform = `translateX(${centerOffset - slideOffset}px)`;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 4000);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  };

  nextBtn.addEventListener('click', () => {
    updateCarousel(currentIndex + 1);
    startAutoSlide();
  });

  prevBtn.addEventListener('click', () => {
    updateCarousel(currentIndex - 1);
    startAutoSlide();
  });

  dotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('dot')) {
      const targetIndex = parseInt(e.target.getAttribute('data-index'), 10);
      updateCarousel(targetIndex);
      startAutoSlide();
    }
  });

  window.addEventListener('resize', () => updateCarousel(currentIndex));
  updateCarousel(0);

  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
  }

  startAutoSlide();
}

/* ==========================================================================
   3. Version Carousel Roster (25 Members per Carousel Slide)
   ========================================================================== */
function switchRosterVersion(version, targetBtn) {
  activeVersion = version;

  document
    .querySelectorAll('.v-tab-btn')
    .forEach((btn) => btn.classList.remove('active'));
  if (targetBtn) targetBtn.classList.add('active');

  const v1Container = document.getElementById('roster-v1-container');
  const v2Container = document.getElementById('roster-v2-container');

  if (version === 'v1') {
    if (v1Container) v1Container.style.display = 'block';
    if (v2Container) v2Container.style.display = 'none';
  } else {
    if (v1Container) v1Container.style.display = 'none';
    if (v2Container) v2Container.style.display = 'block';
  }

  renderRoster();
}

function renderRoster() {
  const targetContainerId =
    activeVersion === 'v1' ? 'roster-v1-container' : 'roster-v2-container';
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  container.style.display = 'block';
  container.style.width = '100%';

  const searchInput = document.getElementById('public-roster-search');
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtered = [...rosterMembers, ...streamerMembers]
    .filter((member) => {
      const memberVersion = (member.version || 'v1').toLowerCase();
      const matchesVersion = memberVersion === activeVersion.toLowerCase();

      let matchesRole = false;
      if (activeRoleFilter.toUpperCase() === 'ALL') {
        matchesRole = true;
      } else {
        matchesRole =
          (member.role || '').toLowerCase() === activeRoleFilter.toLowerCase();
      }

      const matchesSearch = (member.ign || '')
        .toLowerCase()
        .includes(searchQuery);

      return matchesVersion && matchesRole && matchesSearch;
    })
    .sort((a, b) => {
      const nameA = (a.ign || '').toLowerCase();
      const nameB = (b.ign || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const totalCountElem = document.getElementById('total-count');
  if (totalCountElem) totalCountElem.innerText = filtered.length;

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `<p class="no-members" style="text-align: center; color: #888; padding: 2rem;">No ${activeVersion.toUpperCase()} members found.</p>`;
    return;
  }

  const sortedMembers = [...filtered].sort((a, b) => {
    const nameA = (a.ign || '').toLowerCase();
    const nameB = (b.ign || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const columns = [[], [], []];
  const perColumn = Math.ceil(sortedMembers.length / 3);

  for (let i = 0; i < sortedMembers.length; i += 1) {
    const columnIndex = Math.floor(i / perColumn);
    if (columnIndex < 3) {
      columns[columnIndex].push(sortedMembers[i]);
    }
  }

  const grid = document.createElement('div');
  grid.className = 'roster-grid';

  columns.forEach((columnMembers) => {
    const column = document.createElement('div');
    column.className = 'roster-column';

    columnMembers.forEach((member) => {
      const card = document.createElement('div');
      card.className = 'member-card';
      card.innerHTML = `<h3>${member.ign}</h3>`;
      column.appendChild(card);
    });

    grid.appendChild(column);
  });

  container.appendChild(grid);
}

function renderStreamers() {
  const container = document.getElementById('public-streamers-list');
  const dotsContainer = document.getElementById('streamer-dots');
  if (!container) return;

  container.innerHTML = '';
  if (streamerMembers.length === 0) {
    container.innerHTML = '<p class="no-members">No streamers found.</p>';
    if (dotsContainer) dotsContainer.innerHTML = '';
    return;
  }

  const sortedStreamers = streamerMembers
    .slice()
    .sort((a, b) => (a.ign || '').localeCompare(b.ign || ''));

  if (featuredStreamerIndex >= sortedStreamers.length)
    featuredStreamerIndex = 0;

  sortedStreamers.forEach((streamer) => {
    const card = document.createElement('article');
    card.className = 'streamer-card';
    const profileUrl =
      streamer.tiktokUrl ||
      `https://www.tiktok.com/${(streamer.username || `@${streamer.ign}`).replace(/^@?/, '@')}`;
    card.innerHTML = `
        ${streamer.image ? `<img src="${streamer.image}" alt="${streamer.ign}" class="streamer-avatar">` : '<div class="streamer-avatar streamer-avatar-empty">TK</div>'}
        <div class="streamer-card-content">
          <span class="streamer-version">${(streamer.version || 'v1').toUpperCase()}</span>
          <h3>${streamer.ign}</h3>
          <p class="streamer-username">${streamer.username || `@${streamer.ign.toLowerCase()}`}</p>
          <p>${streamer.tiktokName || streamer.ign}</p>
          <p class="streamer-stats">${streamer.followers || 0} followers · ${streamer.following || 0} following</p>
          <p>${streamer.details || 'Top Kings streamer'}</p>
        </div>
      `;
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () =>
      window.open(profileUrl, '_blank', 'noopener'),
    );
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.open(profileUrl, '_blank', 'noopener');
      }
    });
    container.appendChild(card);
  });

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    sortedStreamers.forEach((streamer, index) => {
      const dot = document.createElement('button');
      dot.className = `streamer-ign-tab ${index === featuredStreamerIndex ? 'active' : ''}`;
      dot.type = 'button';
      dot.textContent = streamer.ign;
      dot.setAttribute('aria-label', `Show ${streamer.ign}`);
      dot.setAttribute('aria-pressed', index === featuredStreamerIndex);
      dot.addEventListener('click', () => updateFeaturedStreamer(index));
      dotsContainer.appendChild(dot);
    });
  }

  updateFeaturedStreamer(featuredStreamerIndex);
}

function updateFeaturedStreamer(index) {
  const track = document.getElementById('public-streamers-list');
  const dots = document.querySelectorAll('.streamer-ign-tab');
  if (!track || streamerMembers.length === 0) return;

  const cards = Array.from(track.children);
  if (index < 0) featuredStreamerIndex = cards.length - 1;
  else if (index >= cards.length) featuredStreamerIndex = 0;
  else featuredStreamerIndex = index;

  track.style.transform = `translateX(-${featuredStreamerIndex * 100}%)`;
  cards.forEach((card, cardIndex) => {
    card.classList.toggle('active', cardIndex === featuredStreamerIndex);
  });
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === featuredStreamerIndex);
    dot.setAttribute('aria-pressed', dotIndex === featuredStreamerIndex);
  });

  const activeTab = dots[featuredStreamerIndex];
  activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

/* ==========================================================================
   4. Application Form & Modal Controls
   ========================================================================== */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function submitForm(e) {
  e.preventDefault();

  const gameImgFile = document.getElementById('gameProfileImg').files[0];
  const fbImgFile = document.getElementById('fbProfileImg').files[0];

  try {
    const gameProfileImg = gameImgFile
      ? await readFileAsDataURL(gameImgFile)
      : '';
    const fbProfileImg = fbImgFile ? await readFileAsDataURL(fbImgFile) : '';

    const newReq = {
      id: Date.now(),
      name: document.getElementById('name').value,
      ign: document.getElementById('ign').value,
      uid: document.getElementById('uid').value,
      streamerId: document.getElementById('streamerId').value,
      fbLink: document.getElementById('fbLink').value,
      role: document.getElementById('role').value,
      gameProfileImg: gameProfileImg,
      fbProfileImg: fbProfileImg,
      submittedAt: Date.now(),
    };

    const existingRequests = JSON.parse(
      localStorage.getItem('tk_requests') || '[]',
    );
    existingRequests.push(newReq);
    localStorage.setItem('tk_requests', JSON.stringify(existingRequests));

    alert(
      `Application for ${newReq.ign} submitted successfully! Top Kings admins will review your application.`,
    );
    e.target.reset();
  } catch (err) {
    alert(
      'Image file size is too large for LocalStorage. Please upload smaller images.',
    );
  }
}

function openModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.scrollTop = 0;
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;
  }
}

function closeModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) modal.style.display = 'none';
}

function openThirdMonthModal() {
  const modal = document.getElementById('thirdMonthModal');
  if (modal) modal.style.display = 'flex';
}

function closeThirdMonthModal() {
  const modal = document.getElementById('thirdMonthModal');
  if (modal) modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  const currentDate = new Date();
  const isThirdMonthsaryMonth = currentDate.getMonth() === 7;
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const seenKey = 'tk_third_month_modal_seen';

  if (!isThirdMonthsaryMonth) return;

  const hasSeenThisVisit = sessionStorage.getItem(seenKey) === 'true';
  if (!hasSeenThisVisit) {
    setTimeout(() => {
      openThirdMonthModal();
      sessionStorage.setItem(seenKey, 'true');
    }, 800);
  }
});

window.onclick = function (e) {
  const modal = document.getElementById('rulesModal');
  if (e.target === modal) closeModal();

  const thirdMonthModal = document.getElementById('thirdMonthModal');
  if (e.target === thirdMonthModal) closeThirdMonthModal();
};

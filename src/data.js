// Content taken from priyowittesa.framer.wiki and the CV (UIUX_CV I Komang Danda Priyowittesa.pdf).

export const person = {
  fullName: 'I Komang Danda Priyowittesa',
  role: 'UI/UX Designer',
  email: 'priyowittesa@gmail.com',
  phone: '+62 822 6739 6716',
  phoneHref: 'tel:+6282267396716',
  city: 'Jakarta Timur, Indonesia',
  resume: 'https://drive.google.com/file/d/1AvS7Kx49AsP9lnOURcqLqJ6MDwGoF65c/view?usp=sharing',
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/xikdp/' },
    { label: 'Dribbble', href: 'https://dribbble.com/xikdp' },
    { label: 'Medium', href: 'https://xikdp.medium.com/' },
    { label: 'Instagram', href: 'https://www.instagram.com/xikdp/' },
  ],
}

// Every project as it appears on priyowittesa.framer.wiki/projects: title, tags, font,
// description and the buttons its own page offers (Prototype, Case Study).
const UI = 'User Interface'
const UX = 'User Experience'
const proto = (href) => ({ label: 'Prototype', href })
const study = (href) => ({ label: 'Case study', href })

export const projects = [
  { name: 'Folio 2.0', title: 'Portfolio Website V2.0', tags: [UI, 'tech', 'Prototype'], font: 'Recoleta',
    desc: 'My second UI/UX portfolio, built in Framer: planetary visuals on a clean white canvas, showcasing selected work, skills and experience.',
    links: [proto('https://priyowittesa.framer.wiki/')],
    img: '/img/portfolio-v20.jpeg', w: 1501, h: 936, alt: 'Portfolio website version 1.0 in aurora gradient' },
  { name: 'Celestify', title: 'Seamless Learning Experience: E-Learning Platform UI', tags: [UI, 'Tech'], font: 'Poppins',
    desc: 'Complete e-learning flow from landing to success with a clean and consistent UX, including 6 screens, an editable Figma file, and reusable components ready for real product use.',
    links: [{ label: 'Gumroad', href: 'https://inseneca.gumroad.com/l/celestifyelearning' }],
    img: '/img/celestify.png', w: 1536, h: 1024, alt: 'Celestify e-learning platform screens' },
  { name: 'Salex', title: 'Salex', tags: [UI, 'Prototype'], font: 'Nunito',
    desc: 'Unlock the full financial picture with the Salex dashboard. Track profit, revenue, expenses and product performance effortlessly. Salex streamlines business analytics with insightful data for strategic decision-making.',
    links: [proto('https://www.figma.com/proto/GYbHJyYYvMwC6sU4Ux97f0/website-dashboard?page-id=0%3A1&type=design&node-id=1-3&viewport=337%2C-316%2C0.35&t=4JUjVXI4WAf1PZNG-9&scaling=min-zoom&starting-point-node-id=1%3A3&show-proto-sidebar=1')],
    img: '/img/salex.png', w: 2048, h: 1536, alt: 'Salex dashboard with sales chart, income and transactions' },
  { name: 'Healtaliz', title: 'Healtaliz', tags: [UX, UI, 'Prototype'], font: 'Inter',
    desc: 'A product that started from an improvised idea. Healtaliz offers online medical consultations, health product purchases, a showcase of hospitals partnered with BPJS, and offline doctor appointment scheduling.',
    links: [
      proto('https://www.figma.com/proto/ALUrZOGeVZVdWFCI8lWfzX/heataliz?page-id=5%3A2&type=design&node-id=21-679&viewport=514%2C-9719%2C0.98&t=iSkCPRW1SyVvPMjP-9&scaling=scale-down&starting-point-node-id=21%3A679&show-proto-sidebar=1'),
      study('https://xikdp.medium.com/studi-kasus-ui-ux-healtaliz-14eaa087e469'),
    ],
    img: '/img/healtaliz.png', w: 2048, h: 1536, alt: 'Healtaliz mobile app home, consultation and splash screens' },
  { name: 'Nutriet', title: 'Nutriet', tags: [UI, 'Prototype'], font: 'Quicksand, Ooredoo',
    desc: 'A UI exploration for an intuitive diet planning mobile app, with seamless navigation and an aesthetic design for crafting your path to a healthier life.',
    links: [
      proto('https://www.figma.com/proto/RhvAnTD30tiwtyssjhIrTx/NUTRIET?page-id=8%3A115&type=design&node-id=44-1166&viewport=96%2C348%2C0.02&t=pzbG581nXZqYdGLk-9&scaling=scale-down&starting-point-node-id=44%3A1166&show-proto-sidebar=1'),
      { label: 'Gumroad', href: 'https://inseneca.gumroad.com/l/nutriethealtanddiet' },
    ],
    img: '/img/nutriet.png', w: 2048, h: 1536, alt: 'Nutriet diet planning mobile app screens' },
  { name: 'Empatin', title: 'Empatin', tags: [UI, 'Prototype'], font: 'Poppins',
    desc: 'A Buy Now Pay Later mobile app. This hi-fi design focuses on the Referral and Voucher Reward features.',
    links: [proto('https://www.figma.com/proto/7kOa0g4SdKLfCAxJlOHDq6/mobil-improve-%26-referral?page-id=2%3A1894&type=design&node-id=238-21805&viewport=-1084%2C1303%2C0.13&t=xLonXWUfPoBUHWkj-9&scaling=min-zoom&starting-point-node-id=238%3A21805&show-proto-sidebar=1')],
    img: '/img/empatin.png', w: 1800, h: 1200, alt: 'Empatin referral and voucher reward screens' },
  { name: 'Anti Hoax', title: 'Anti Hoax Covid 19', tags: [UX, UI, 'Prototype'], font: 'Nunito Sans',
    desc: 'A mobile app to combat the spread of COVID-19 fake news. Users can tell real news from hoaxes, and report news that seems dubious.',
    links: [
      proto('https://www.figma.com/proto/lEjmGIsM0ptQYVYK3Iqftd/UI-Design-Mobile?page-id=0%3A1&type=design&node-id=47-130&viewport=1017%2C342%2C0.15&t=nhBEy33G0maT6SfO-9&scaling=scale-down&starting-point-node-id=47%3A130&show-proto-sidebar=1'),
      study('https://xikdp.medium.com/studi-kasus-ui-ux-aplikasi-anti-hoax-covid-19-521896e16141'),
    ],
    img: '/img/antihoax.png', w: 2048, h: 1536, alt: 'Anti Hoax COVID-19 mobile app screens' },
  { name: 'Xstudie Web', title: 'Xstudie Website', tags: [UI, 'Prototype'], font: 'Nunito, Ooredoo',
    desc: 'A website to learn anything you want about Design, App Development and Product Management. Anytime, anywhere with Xstudie.',
    links: [proto('https://www.figma.com/proto/yZFpVDk0lizIL4pKMOuMZC/xstudie-web%26mobile?page-id=0%3A1&type=design&node-id=1-1758&viewport=-26%2C186%2C0.05&t=F6nvWCAzJSSxJ25O-1&scaling=min-zoom&mode=design')],
    img: '/img/xstudie-web.png', w: 2048, h: 1456, alt: 'Xstudie learning website pages' },
  { name: 'Xstudie App', title: 'Xstudie Mobile App', tags: [UI, 'Prototype'], font: 'Nunito, Ooredoo',
    desc: 'A mobile app to learn anything you want about Design, App Development and Product Management. Anytime, anywhere with Xstudie.',
    links: [proto('https://www.figma.com/proto/yZFpVDk0lizIL4pKMOuMZC/xstudie-web%26mobile?page-id=206%3A9&type=design&node-id=608-2702&viewport=-1034%2C34%2C0.17&t=B7cGQuM5sc9frf1k-9&scaling=scale-down&starting-point-node-id=608%3A2702&show-proto-sidebar=1')],
    img: '/img/xstudie-app.png', w: 2048, h: 1536, alt: 'Xstudie learning mobile app screens' },
  { name: 'Nature Odyssey', title: 'Nature Odyssey', tags: [UI, 'Prototype'], font: 'Montserrat',
    desc: 'Join the movement for a thriving planet. Embrace sustainable practices, champion conservation and raise awareness, to preserve biodiversity and live in harmony with nature.',
    links: [proto('https://www.figma.com/proto/i0rzLZPeaWQH2PxOmiQhm1/Nature-odyssey?page-id=0%3A1&type=design&node-id=28-401&viewport=1590%2C-225%2C0.2&t=D91B02DBJRcF1Pz2-9&scaling=min-zoom&starting-point-node-id=28%3A401&show-proto-sidebar=1')],
    img: '/img/nature-odyssey.png', w: 2048, h: 1536, alt: 'Nature Odyssey conservation website' },
  { name: 'Luminfts', title: 'LUMINFTs', tags: [UI, 'Prototype'], font: 'Montserrat',
    desc: 'An NFT marketplace landing page. Discover exclusive digital art where each NFT is a unique masterpiece, and explore the world of digital creativity.',
    links: [proto('https://www.figma.com/proto/6hu208msyts1mcofUGewex/NFT-Fake-Project?page-id=0%3A1&type=design&node-id=2-2&viewport=414%2C447%2C0.13&t=ekE5yfVcDQuSfm3Z-9&scaling=min-zoom&show-proto-sidebar=1&starting-point-node-id=2%3A2')],
    img: '/img/luminfts.png', w: 2048, h: 1536, alt: 'Luminfts NFT marketplace landing page' },
  { name: 'Digimau', title: 'Digimau', tags: [UI], font: 'IBM Plex Mono',
    desc: 'A website for digital marketing services, website development and user interface design specialists, designed with the Neo-Brutalism concept used by companies like Figma.',
    links: [],
    img: '/img/digimau.png', w: 2048, h: 1536, alt: 'Digimau neo-brutalist website' },
  { name: 'Podcasic', title: 'Podcasic', tags: [UI], font: 'DM Serif Text',
    desc: 'A mobile app to stream your favourite podcasts and music anywhere, with thousands of podcasts and songs available anytime.',
    links: [],
    img: '/img/podcasic.jpg', w: 1000, h: 750, alt: 'Podcasic podcast streaming app screens' },
  { name: 'Folio 1.1', title: 'Portfolio Website V1.1', tags: [UI, 'Tech', 'Prototype'], font: 'Quicksand',
    desc: 'My UI/UX portfolio with a planetary theme on an elegant white background, where planetary aesthetics meet the simplicity of white.',
    links: [proto('https://xikdp.framer.wiki/')],
    img: '/img/portfolio-v11.jpg', w: 1600, h: 792, alt: 'Portfolio website version 1.1 with a planetary theme' },
  { name: 'Folio 1.0', title: 'Portfolio Website V1.0', tags: [UI, 'Prototype'], font: 'Quicksand',
    desc: 'My earlier UI/UX portfolio: a mix of dark colours and shades of purple gradients.',
    links: [proto('https://signposts-control-846091-ad06d1a3d.framer.app/')],
    img: '/img/portfolio-v10.jpg', w: 1350, h: 896, alt: 'Portfolio website version 1.0 in dark tones' },
]

export const experience = [
  {
    short: 'Altimeda',
    when: 'Jan 2024–now',
    title: 'UI/UX Designer, PT. Altimeda Cipta Visitama',
    place: 'Jakarta Selatan',
    points: [
      'Design enterprise software used across management, finance and field operations.',
      'Handle three to four projects at the same time, prioritised by urgency and complexity.',
      'Deliver three to four features a day on high-priority requests, against a normal one to two.',
      'Run Design Thinking research and make user flows, wireframes, prototypes and high-fidelity screens.',
      'Build design systems from scratch for projects of more than 100 screens, kept consistent.',
      'Work with clients, Project Managers and developers; delivered two client projects in one week each.',
    ],
  },
  {
    short: 'Xendit',
    when: 'Jun–Aug 2022',
    title: 'UI/UX Designer Intern, Special Project',
    place: 'Jakarta Selatan',
    points: [
      'Worked in Scrum with Product, Marketing, Commercial and design teams at a payments company.',
      'Analysed five to six competitor products to find opportunities and areas to improve.',
      'Designed two product features: user flows, UI flows and high-fidelity designs.',
      'Made two to three design alternatives for A/B testing and reviewed them with Product Managers.',
    ],
  },
  {
    short: 'Cafeasy',
    when: '2022–2023',
    title: 'Backend Developer, capstone project',
    place: 'Telkom University, Bandung',
    points: [
      'Built the backend of a cafe app for the Bandung area with MongoDB, Node.js and Express.js.',
      'Designed the database, the RESTful API and an MVC architecture; tested the API in Postman.',
      'Managed the GitHub repository. The finished project received a patent certificate.',
    ],
  },
  {
    short: 'Telkom U',
    when: '2019–2023',
    title: 'Bachelor of Software Engineering, GPA 3.40 / 4.00',
    place: 'Universitas Telkom, Bandung',
    points: [
      'Practicum Assistant for two Web Development classes: more than 15 students across 13 modules.',
      'Internal Student Division Staff, Himpunan Mahasiswa S1 RPL (Jan 2022–Jan 2023).',
      'Information, Media and Creative Staff, Formatur S1 RPL: 10+ event posters, 15+ Instagram posts (Dec 2020–Dec 2021).',
    ],
  },
]

export const skills = [
  { group: 'UX design', items: ['UX research', 'Design Thinking', 'User flows', 'Wireframing', 'Prototyping', 'Usability feedback', 'Benchmarking analysis'] },
  { group: 'UI design', items: ['High-fidelity design', 'Responsive design', 'Design systems', 'Components', 'Style guides'] },
  { group: 'Tools', items: ['Figma', 'FigJam', 'Framer', 'Figma Make', 'v0 by Vercel', 'Google Stitch', 'Claude Design', 'Claude Code'] },
  { group: 'Development', items: ['HTML5, CSS, JavaScript', 'Node.js, Express.js', 'RESTful API', 'MongoDB', 'GitHub, Postman'] },
]

export const records = [
  { group: 'Certificates', items: [
    ['Skill Specialization, UI Design', '2023'],
    ['Rakamin Kickstart UI/UX, Excellent', '2022'],
    ['BuildWith Angga, Gestalt Principle', '2024'],
  ] },
  { group: 'Languages', items: [
    ['Bahasa Indonesia', 'Native'],
    ['English', 'Intermediate'],
  ] },
]

/* Example pictures for each skill, linked from Unsplash (Unsplash License), not stored in the project. */
const unsplash = (id) => `https://images.unsplash.com/photo-${id}?w=560&h=388&fit=crop&q=75&auto=format`

export const skillShots = Object.fromEntries(
  Object.entries({
    'UX research': '1573497491208-6b1acb260507',
    'Design Thinking': '1586936893354-362ad6ae47ba',
    'User flows': '1646617747563-4f080bddf282',
    'Wireframing': '1600132806370-bf17e65e942f',
    'Prototyping': '1576153192396-180ecef2a715',
    'Usability feedback': '1519336367661-eba9c1dfa5e9',
    'Benchmarking analysis': '1504868584819-f8e8b4b6d7e3',
    'High-fidelity design': '1545235617-9465d2a55698',
    'Responsive design': '1768293336571-c48f8765a82d',
    'Design systems': '1561070791-2526d30994b5',
    'Components': '1760008486577-21baa8b560a5',
    'Style guides': '1716471330475-f0669db8947a',
    'Figma': '1653647054667-c99dc7f914ef',
    'FigJam': '1641355527446-232d7f1f2c10',
    'Framer': '1547658719-da2b51169166',
    'Figma Make': '1677442136019-21780ecad995',
    'v0 by Vercel': '1642083139428-9ee5fa423c46',
    'Google Stitch': '1551650975-87deedd944c3',
    'Claude Design': '1586717791821-3f44a563fa4c',
    'Claude Code': '1775994121052-7e653711f72c',
    'HTML5, CSS, JavaScript': '1542831371-29b0f74f9713',
    'Node.js, Express.js': '1619410283995-43d9134e7656',
    'RESTful API': '1594904351111-a072f80b1a71',
    'MongoDB': '1542903660-eedba2cda473',
    'GitHub, Postman': '1556075798-4825dfaaf498',
  }).map(([skill, id]) => [skill, { src: unsplash(id), credit: 'Photo via Unsplash' }])
)

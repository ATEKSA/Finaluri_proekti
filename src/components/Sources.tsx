import React from 'react';

/* Custom SVG Icons for Sources */
const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="var(--color-green)" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="var(--color-neon-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface SourceItem {
  title: string;
  titleEng: string;
  url: string;
  description: string;
  trustReason: string;
  category: 'simulation' | 'academic' | 'curriculum' | 'tool';
}

const SOURCES: SourceItem[] = [
  {
    title: 'PhET ინტერაქტიული სიმულაციები',
    titleEng: 'PhET Interactive Simulations',
    url: 'https://phet.colorado.edu/ka/simulations/filter?subjects=chemistry',
    description: 'კოლორადოს უნივერსიტეტის მიერ შექმნილი უფასო, ინტერაქტიული სიმულაციები ქიმიაში, ფიზიკასა და ბიოლოგიაში. მათ შორისაა ატომების აწყობა, მოლეკულების ფორმა და ქიმიური რეაქციები.',
    trustReason: 'შექმნილია კოლორადოს უნივერსიტეტის ბოულდერის ფიზიკის დეპარტამენტის მიერ. ნობელის პრემიის ლაურეატ კარლ ვიმანის ხელმძღვანელობით.',
    category: 'simulation',
  },
  {
    title: 'IUPAC — ქიმიის საერთაშორისო კავშირი',
    titleEng: 'International Union of Pure and Applied Chemistry',
    url: 'https://iupac.org/',
    description: 'ქიმიის ნომენკლატურის, ტერმინოლოგიისა და სტანდარტების მთავარი საერთაშორისო ორგანიზაცია. IUPAC ადგენს ელემენტების სახელებს, აღნიშვნებს და ატომურ მასებს.',
    trustReason: 'ქიმიის სამეცნიერო საზოგადოების ყველაზე ავტორიტეტული ორგანიზაცია, დაარსებული 1919 წელს.',
    category: 'academic',
  },
  {
    title: 'ეროვნული სასწავლო გეგმა — ქიმია',
    titleEng: 'Georgian National Curriculum - Chemistry',
    url: 'https://ncp.ge/',
    description: 'საქართველოს განათლებისა და მეცნიერების სამინისტროს სასწავლო გეგმა, სადაც განსაზღვრულია ქიმიის სწავლების სტანდარტები და მოსალოდნელი შედეგები VII-XII კლასებისთვის.',
    trustReason: 'საქართველოს ეროვნული სასწავლო გეგმის ოფიციალური პლატფორმა, შეესაბამება ქვეყნის განათლების კანონმდებლობას.',
    category: 'curriculum',
  },
  {
    title: 'პერიოდული სისტემა — Ptable',
    titleEng: 'Ptable - Interactive Periodic Table',
    url: 'https://ptable.com/',
    description: 'ინტერაქტიული პერიოდული ცხრილი, სადაც შეგიძლიათ ნახოთ თითოეული ელემენტის ატომური ნომერი, მასა, ელექტრონული კონფიგურაცია და ფიზიკური თვისებები.',
    trustReason: 'ფართოდ გამოყენებული საგანმანათლებლო რესურსი, აღიარებული მსოფლიოს წამყვანი უნივერსიტეტების მიერ.',
    category: 'tool',
  },
  {
    title: 'ქიმიური ბმების ვიზუალიზაცია — LibreTexts',
    titleEng: 'Chemical Bonding - LibreTexts',
    url: 'https://chem.libretexts.org/Bookshelves/General_Chemistry/Map%3A_Chemistry_-_The_Central_Science_(Brown_et_al.)/08%3A_Basic_Concepts_of_Chemical_Bonding',
    description: 'ღია წვდომის სახელმძღვანელო, რომელიც დეტალურად ხსნის კოვალენტურ და იონურ ბმებს, ელექტრონეგატიურობას და ლუისის სტრუქტურებს.',
    trustReason: 'ღია საგანმანათლებლო რესურსი, დაფინანსებული აშშ-ს განათლების დეპარტამენტის მიერ.',
    category: 'academic',
  },
  {
    title: 'Khan Academy — ქიმიური ბმები',
    titleEng: 'Khan Academy - Chemical Bonds',
    url: 'https://www.khanacademy.org/science/chemistry/chemical-bonds',
    description: 'უფასო ვიდეო-გაკვეთილები ქიმიურ ბმებზე, ატომურ სტრუქტურაზე და მოლეკულურ გეომეტრიაზე. ხელმისაწვდომია ქართულ ენაზეც.',
    trustReason: 'არაკომერციული საგანმანათლებლო ორგანიზაცია, რომელსაც იყენებს 120+ მილიონი მოსწავლე მთელს მსოფლიოში.',
    category: 'simulation',
  },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  simulation: { label: 'სიმულაცია', color: 'var(--color-cyan)' },
  academic: { label: 'აკადემიური', color: 'var(--color-purple)' },
  curriculum: { label: 'სასწავლო გეგმა', color: 'var(--color-green)' },
  tool: { label: 'ინსტრუმენტი', color: 'var(--color-amber)' },
};

export const Sources: React.FC = () => {
  return (
    <div className="sources-container animate-fade-in">
      <header className="section-header">
        <h1>ინფორმაციის წყაროები და სანდოობა</h1>
        <p>
          ქვემოთ მოცემული რესურსები გამოყენებულ იქნა აპლიკაციის თეორიული ნაწილის, ქიმიური მოდელებისა
          და საგანმანათლებლო შინაარსის შესაქმნელად. ყველა წყარო აკადემიურია და საჯაროდ ხელმისაწვდომი.
        </p>
      </header>

      <div className="sources-grid">
        {SOURCES.map((source, idx) => {
          const cat = categoryLabels[source.category];
          return (
            <div key={idx} className="source-card glass-panel">
              <div className="source-card-header">
                <span className="source-category-badge" style={{ borderColor: cat.color, color: cat.color }}>
                  {cat.label}
                </span>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link-icon">
                  <LinkIcon />
                </a>
              </div>

              <h3 className="source-title">{source.title}</h3>
              <span className="source-title-eng">{source.titleEng}</span>

              <p className="source-description">{source.description}</p>

              <div className="source-trust">
                <ShieldIcon />
                <div>
                  <span className="trust-label">რატომ არის სანდო?</span>
                  <p className="trust-text">{source.trustReason}</p>
                </div>
              </div>

              <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-visit-btn">
                ვებგვერდის ნახვა →
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sources;

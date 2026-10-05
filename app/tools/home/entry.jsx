// The EM3 home screen: GoodFlip's Homepage recipe, built from the design system's own components
// (~/Documents/GF/design.goodflip.in, src/registry/components), with the EM3 pillar cards under the carousel.
// Build: app/tools/home/build.sh
import React from 'react';
import { createRoot } from 'react-dom/client';
import TopNav from 'ds/top-nav/TopNav';
import BottomNav from 'ds/bottom-nav/BottomNav';
import ActionCard from 'ds/action-card/ActionCard';
import ScoreCard from 'ds/score-card/ScoreCard';
import TrackerCard from 'ds/tracker-card/TrackerCard';
import BannerCarousel from 'ds/banner-carousel/BannerCarousel';
import { SAMPLE_MACROS, SampleActions, trackerIcon } from 'ds/tracker-card';
import EM3Cards from './em3-cards.jsx';

const noop = () => {};
const BANNERS = [
  { image: '/web-icons/Kickstarter-banner.png', alt: 'Metabolic Kickstarter', onClick: noop },
  { image: '/web-icons/Cgm-banner.png', alt: 'CGM', onClick: noop },
  { image: '/web-icons/Lab-tests-banner.png', alt: 'Lab tests', onClick: noop },
  { image: '/web-icons/Bca-banner.png', alt: 'Body composition analysis', onClick: noop },
];
const SectionTitle = ({ children }) => (
  <p className="px-4 text-[16px] font-semibold leading-[22px] tracking-[0.25px] text-GRAY-900">{children}</p>
);
// opening the Eat card goes to the Eat day view, like the tracker it stands in for
const inShell = () => { try { return window.parent !== window && /app\.html$/.test(parent.location.pathname); } catch (e) { return false; } };
const openPillar = k => { if (k !== 'eat') return; if (inShell()) parent.postMessage({ nav: 'eat' }, '*'); else location.href = 'eat.html'; };

function Home() {
  return (
    <div className="flex w-full flex-col bg-white">
      <div className="px-4 pb-3 pt-4">
        <TopNav onMenu={noop} onCoins={noop} onChat={noop} onNotifications={noop} onProfile={noop} />
      </div>
      <div className="flex flex-col gap-6 pb-6">
        {/* Welcome: greeting, the owned program, then its campaign carousel (as the app orders them) */}
        <div className="flex flex-col gap-3">
          <p className="px-4 text-[16px] font-bold leading-[1.2] tracking-[0.25px] text-GRAY-900">Hi Kumar Radhakrishnan</p>
          <div className="px-4">
            <ActionCard wide tinted chevron flat size={38} onClick={noop}
              media={<img src="/web-icons/MK-logo.svg" alt="" className="h-full w-auto object-contain" />}>
              Access your Metabolic Kickstarter
            </ActionCard>
          </div>
          <BannerCarousel items={BANNERS} />
        </div>

        {/* EM3: one card per pillar, scrolled sideways */}
        <div className="flex flex-col gap-3">
          <SectionTitle>Your EM3</SectionTitle>
          <EM3Cards onOpen={openPillar} />
        </div>

        <div className="flex flex-col gap-3">
          <SectionTitle>Your Metabolic Score</SectionTitle>
          <div className="px-4"><ScoreCard title="Your Metabolic score" status="Start understanding your metabolic health" onClick={noop} /></div>
        </div>

        <div className="flex flex-col gap-3">
          <SectionTitle>GoodFlip Services</SectionTitle>
          <div className="flex items-start justify-center gap-6 px-4">
            <ActionCard label="Care Programs" media={<img src="/web-icons/Care-programs.png" alt="" className="h-full w-auto rounded-[10px] object-contain" />} onClick={noop} />
            <ActionCard label="Shop Products" media={<img src="/web-icons/Shop-products.png" alt="" className="h-full w-auto rounded-[10px] object-contain" />} onClick={noop} />
            <ActionCard label="Book Lab Tests" wide badge="50% OFF" media={<img src="/web-icons/Lab-tests.png" alt="" className="h-full w-auto rounded-[10px] object-contain" />} onClick={noop}>
              Get lab tests at upto
            </ActionCard>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SectionTitle>Your Health Trackers</SectionTitle>
          <div className="flex flex-col gap-4 px-4">
            <TrackerCard title="Nutrition" icon={trackerIcon('Nutrition')} coins metric={{ label: 'Calories Consumed', value: '850 Kcal' }}
              subMetrics={SAMPLE_MACROS} actionsLabel="Log your meals:" actions={<SampleActions />} onClick={noop} />
            <TrackerCard title="Physical Activity" icon={trackerIcon('physical-activity')} coins metric={{ label: 'Calories Burned', value: '150 Kcal' }}
              secondaryMetric={{ label: 'Time', value: '45 minutes' }} onClick={noop} />
            <div className="flex items-center gap-1">
              <span className="whitespace-nowrap text-[12px] tracking-[0.25px] text-GRAY-500">More Trackers</span>
              <span className="h-px flex-1 [background:repeating-linear-gradient(90deg,#D0D5DD_0_8px,transparent_8px_14px)]" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {['Sleep', 'Steps', 'Water', 'Mindfulness'].map(t => <TrackerCard key={t} compact className="shrink-0" title={t} icon={trackerIcon(t)} coins onClick={noop} />)}
            </div>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 z-10 bg-white" style={{ paddingBottom: "var(--gf-home-h, 0px)" }}><BottomNav active="home" onChange={noop} /></div>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<Home />);

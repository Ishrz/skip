import { BottomDecoration, CoursesSection, Hero, HomeNavbar } from "@/components/home/sections";

export default function Home() {
  return (
    <>
      <div className="relative bg-gradient-to-b from-primary-100/60 via-white/80 to-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(191,219,254,0.5)_48%,transparent_62%)]" />
        <HomeNavbar className="relative z-10" />
        <div className="relative">
          <Hero />
        </div>
      </div>
      <main className="bg-gradient-to-b from-primary-100/50 via-primary-50 to-white">
        <CoursesSection />
        <BottomDecoration />
      </main>
    </>
  );
}

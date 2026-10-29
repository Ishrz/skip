import {
  Section,
  Hero,
  Colors,
  Typography,
  TypeScale,
  Spacing,
  RadiusShadows,
  Icons,
  Buttons,
  Inputs,
  Badges,
  StatusIndicators,
  ProgressBars,
  CardsRow,
  NavigationRow,
  Principles,
} from "@/components/showcase/sections";

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 md:px-6">
      <div className="mx-auto grid max-w-6xl gap-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <Hero />
          <Section number="01" title="Colors" className="lg:col-span-2">
            <Colors />
          </Section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Section number="02" title="Typography">
            <Typography />
          </Section>
          <Section number="03" title="Type Scale" className="lg:col-span-2">
            <TypeScale />
          </Section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section number="04" title="Spacing System">
            <Spacing />
          </Section>
          <Section number="05" title="Radius & Shadows">
            <RadiusShadows />
          </Section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Section number="06" title="Icons">
            <Icons />
          </Section>
          <Section number="07" title="Buttons">
            <Buttons />
          </Section>
          <Section number="08" title="Inputs">
            <Inputs />
          </Section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Section number="09" title="Badges / Tags">
            <Badges />
          </Section>
          <Section number="10" title="Status / Indicators">
            <StatusIndicators />
          </Section>
          <Section number="11" title="Progress Bar">
            <ProgressBars />
          </Section>
        </div>

        <Section
          number="12"
          title="Cards"
          contentClassName="!mt-4"
          className="py-4"
        >
          <CardsRow />
        </Section>

        <Section number="13" title="Navigation">
          <NavigationRow />
        </Section>

        <Section number="14" title="Principles">
          <Principles />
        </Section>
      </div>
    </div>
  );
}

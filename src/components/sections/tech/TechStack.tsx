import { TechGlobe } from "@/components/sections/tech/TechGlobe";
import { Reveal } from "@/components/ui/Reveal";
import { techGroups } from "@/data/tech";

const techs = techGroups.flatMap((g) => g.items.map((t) => ({ ...t, category: g.category })));

/** The tech page is just the globe, filling the screen under the header. */
export function TechStack() {
  return (
    <section className="flex flex-1 items-center justify-center">
      <Reveal>
        {/* Icons are rendered here on the server and passed in as children: react-icons are functions,
            which can't cross into a Client Component as props. Only plain data goes in `items`. */}
        <TechGlobe items={techs.map(({ name, level, category }) => ({ name, level, category }))}>
          {techs.map(({ name, icon: Icon, color }) => (
            // Brand colour from the data; logos without one (black ones) follow the text colour
            <Icon key={name} color={color} className="size-8 sm:size-10" aria-hidden />
          ))}
        </TechGlobe>
      </Reveal>
    </section>
  );
}

import { Constellation } from "@/components/sections/experience/Constellation";
import { experience } from "@/data/experience";

const year = (date: string) => date.split(" ").at(-1) ?? date;

/**
 * One-screen Experience page: the jobs as a constellation (oldest → newest, so the path ends at today). Clicking a
 * star opens that job in a popup.
 * Every job's popup content is rendered here, on the server, and handed to the client `Constellation` as `panels`:
 * all five are in the HTML (search engines), and the client only picks which one the popup shows.
 */
export function Experience() {
  // The data is newest first; the sky reads left to right in time
  const jobs = [...experience].reverse();

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 [@media(min-height:880px)]:py-6">
      <Constellation
        stars={jobs.map((job) => {
          const from = year(job.start);
          const to = job.end === "Present" ? "now" : year(job.end);
          return { company: job.company, short: job.short ?? job.company, years: from === to ? from : `${from}–${to}` };
        })}
        panels={jobs.map((job) => (
          <div key={job.company}>
            <p className="text-sm sm:text-base">
              <span className="font-semibold">{job.role}</span> · {job.start} – {job.end}
              {job.companyNote && <> · {job.companyNote}</>}
            </p>
            {job.summary && (
              <div className="mt-4 space-y-3 text-base leading-relaxed sm:text-lg">
                {job.summary.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            )}
            <h3 className="mt-6 text-xs font-semibold tracking-widest uppercase">What I worked on</h3>
            <ul className="mt-3 space-y-4">
              {job.highlights.map((h) => (
                <li key={h.title} className="border-l-2 border-accent/50 pl-4">
                  <h4 className="font-semibold">{h.title}</h4>
                  <p className="mt-1 leading-relaxed">{h.text}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      />
    </section>
  );
}

import { CalendarDays, MapPin, Clock, Users } from "lucide-react";

const DUMMY_EVENTS = [
  {
    id: 1,
    title: "Community Clean-Up Drive",
    description:
      "Join fellow residents to clean up the Riverside Park area. Gloves and bags provided.",
    location: "Riverside Park",
    date: "Mar 1, 2025",
    time: "8:00 AM – 12:00 PM",
    attendees: 34,
    tag: "Environment",
  },
  {
    id: 2,
    title: "Town Hall: Road Safety Concerns",
    description:
      "Open forum with the local council to discuss reported road safety issues in the district.",
    location: "City Community Centre",
    date: "Mar 8, 2025",
    time: "5:30 PM – 7:00 PM",
    attendees: 87,
    tag: "Safety",
  },
  {
    id: 3,
    title: "Streetlight Audit — Ward 12",
    description:
      "Volunteer walk-through to document non-functional streetlights for the Electrical dept.",
    location: "Ward 12 Meeting Point",
    date: "Mar 15, 2025",
    time: "6:00 PM – 8:00 PM",
    attendees: 19,
    tag: "Infrastructure",
  },
];

const TAG_COLORS: Record<string, string> = {
  Environment: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Safety: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Infrastructure: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function EventsPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-background p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-semibold">Civic Events</h1>
            <p className="text-sm text-muted-foreground">Events feature coming soon.</p>
          </div>
        </div>
      </div>

      {/* Dummy event cards */}
      <div className="space-y-3">
        {DUMMY_EVENTS.map((event) => (
          <article
            key={event.id}
            className="rounded-xl border border-border/60 bg-background p-5 shadow-sm opacity-75"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold leading-snug">{event.title}</h3>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  TAG_COLORS[event.tag] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {event.tag}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {event.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {event.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
              <span className="ml-auto flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.attendees} attending
              </span>
            </div>
          </article>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground/60 pb-2">
        Event registration and live data coming soon.
      </p>
    </div>
  );
}

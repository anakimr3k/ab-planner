import ScheduleClient from "@/components/ScheduleClient";
import { getEvents } from "@/app/actions/event";

export default async function SchedulePage() {
  const events = await getEvents();
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <ScheduleClient initialEvents={events} />
    </div>
  );
}
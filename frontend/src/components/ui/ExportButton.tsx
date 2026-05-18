import { FiDownload, FiShare2 } from "react-icons/fi";
import type { ItineraryResponse } from "../../types/itinerary";

interface Props {
  itinerary: ItineraryResponse;
}

export default function ExportButton({ itinerary }: Props) {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `My ${itinerary.travel_style} trip to ${itinerary.destination} (${itinerary.trip_dates}) — ${itinerary.days.length} days planned with WandrAI!`;
    if (navigator.share) {
      navigator.share({ title: `Trip to ${itinerary.destination}`, text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Trip summary copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handlePrint}
        className="btn-secondary flex items-center gap-2 text-sm"
        id="export-pdf-btn"
      >
        <FiDownload size={14} />
        Save as PDF
      </button>
      <button
        onClick={handleShare}
        className="btn-secondary flex items-center gap-2 text-sm"
        id="share-itinerary-btn"
      >
        <FiShare2 size={14} />
        Share
      </button>
    </div>
  );
}

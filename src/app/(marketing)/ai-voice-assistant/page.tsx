import { MarketingNav } from "../marketing-nav";
import { VoiceAssistant } from "./voice-assistant";

export default function AiVoiceAssistantPage() {
  return (
    <>
      <MarketingNav />
      <main className="flex flex-1 flex-col">
        <VoiceAssistant />
      </main>
    </>
  );
}

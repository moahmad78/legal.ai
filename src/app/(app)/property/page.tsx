export const metadata = {
  title: "Property Intelligence - Catalyst Legal AI",
};

export default function PropertyIntelligencePage() {
  return (
    <div className="flex-1 overflow-auto bg-muted/10 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-8 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Property Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Automate property title reviews, analyze registry documents, and flag ownership risks.
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Property Intelligence Module</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            This module is currently being calibrated for state-specific property registry formats.
          </p>
        </div>
      </div>
    </div>
  );
}

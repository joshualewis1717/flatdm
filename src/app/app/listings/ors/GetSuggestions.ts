export type CompleteSuggestionResult = {
  id: string;
  label: string;
  subtitle?: string;
  lat: number;
  long: number;
};

const ORS_BASE_URL = "https://api.openrouteservice.org";
const DEFAULT_SIZE = 4;

export async function CompleteSuggestion(input: string): Promise<CompleteSuggestionResult[]> {
  const query = input.trim();

  if (query.length < 2) {
    return [];
  }

  const url = new URL("/api/location-suggestions", window.location.origin);
  url.searchParams.set("q", query);
  url.searchParams.set("size", String(DEFAULT_SIZE));

  const response = await fetch(url.toString());

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload?.error === "string" && payload.error.trim()) {
        errorMessage = payload.error;
      }
    } catch {
      // Ignore JSON parsing errors and fall back to status text.
    }
    throw new Error(`Suggestion request failed: ${errorMessage}`);
  }

  const payload = (await response.json()) as { suggestions?: unknown };
  const suggestions = Array.isArray(payload?.suggestions) ? payload.suggestions : [];

  return suggestions.flatMap((suggestion) => {
    const typedSuggestion = suggestion as {
      id?: unknown;
      label?: unknown;
      lat?: unknown;
      long?: unknown;
      subtitle?: unknown;
    };

    if (
      typeof typedSuggestion?.id !== "string" ||
      typeof typedSuggestion?.label !== "string"
    ) {
      return [];
    }

    const long = Number(typedSuggestion.long);
    const lat = Number(typedSuggestion.lat);

    if (!Number.isFinite(lat) || !Number.isFinite(long)) {
      return [];
    }

    return [
      {
        id: typedSuggestion.id,
        label: typedSuggestion.label,
        lat,
        long,
        subtitle:
          typeof typedSuggestion.subtitle === "string"
            ? typedSuggestion.subtitle
            : undefined,
      },
    ];
  }).slice(0, DEFAULT_SIZE);
}

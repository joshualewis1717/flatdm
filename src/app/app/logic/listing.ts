// some reusable helpers that relates to listing

// function to consistently get listing title
export function getListingTitle(buildingName: string, flatNumber?: string | null) {
    if (flatNumber && flatNumber.trim() !== "" && flatNumber !== 'WHOLE_PROPERTY') {
      return `Flat ${flatNumber} - ${buildingName}`;
    }
    return buildingName;
  }
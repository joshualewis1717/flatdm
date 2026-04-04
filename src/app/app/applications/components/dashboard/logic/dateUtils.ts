// helper functions relating to dates e.g. formatting, displaying, calculating etc

export function daysUntilDate(dateStr: string): number {// returns number of days until specified date
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));// don't want to go backwards in time
  }
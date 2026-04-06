// constants to be used for prisma queries that relat to landlords


// time limit for when consultant 
export const APPLICATION_EXPIRY_DATE = 7 * 24 * 60 * 60 * 1000// 7 days
// minimum time from current day that users must submit application (e.g. they can't submit an application when they want
// to move today etc.)
export const MINIMUM_APPLICATION_WINDOW = 7;// 7 days
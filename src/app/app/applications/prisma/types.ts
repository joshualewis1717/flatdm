// file containing some prisma types relating to applications

import { ApplicationStatus } from "@prisma/client";



export type ConsultantApplicationActions = Omit<ApplicationStatus, "APPROVED" | 'PENDING' | 'REJECTED'>
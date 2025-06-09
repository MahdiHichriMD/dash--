export interface DailyVolumes {
  receivedChargebacks: { count: number; amount: string };
  issuedRepresentments: { count: number; amount: string };
  issuedChargebacks: { count: number; amount: string };
  receivedRepresentments: { count: number; amount: string };
}

export interface MatchingRecords {
  receivedChargebacksLinked: number;
  receivedChargebacksTotal: number;
  issuedChargebacksLinked: number;
  issuedChargebacksTotal: number;
}

export interface TopIssuer {
  issuer: string;
  libBank: string;
  volume: string;
  count: number;
}

export interface TopAcquirer {
  acquirer: string;
  acquirerRef: string;
  volume: string;
  count: number;
}

export interface VolumeHistoryPoint {
  date: string;
  receivedChargebacks: number;
  issuedRepresentments: number;
  issuedChargebacks: number;
  receivedRepresentments: number;
}

export interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
}

export interface TodayCase {
  id: number;
  type: 'received_chargeback' | 'issued_representment' | 'issued_chargeback' | 'received_representment';
  refFichier: string;
  dateTraitementRpa: string;
  libCommercant: string;
  agence: string;
  amountCp: string;
  [key: string]: any;
}

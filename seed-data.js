import { db } from './server/db.js';
import { 
  users, 
  receivedChargebacks, 
  issuedRepresentments, 
  issuedChargebacks, 
  receivedRepresentments 
} from './shared/schema.js';
import bcrypt from 'bcrypt';

async function seedData() {
  try {
    console.log('Seeding database with sample data...');

    // Sample received chargebacks
    await db.insert(receivedChargebacks).values([
      {
        refFichier: 'RCB-2024-001',
        dateTraitementRpa: new Date('2024-12-09T08:30:00Z'),
        numAffiliation: 'AFF001',
        libCommercant: 'Commerce Plus SARL',
        agence: 'AGE001',
        compte: 'CPT001',
        refFacture: 'INV-2024-001',
        cardholder: 'DUPONT JEAN',
        operationCode: 'CB001',
        codeOperation: 'CHBK',
        libCodeOperation: 'Chargeback Reception',
        amountCp: '1250.50',
        amountOrigine: '1250.50',
        card: '4567****1234',
        processing: 'VISA',
        transactionDate: new Date('2024-12-08T14:22:00Z'),
        authorization: 'AUTH001',
        issuer: 'BNP PARIBAS',
        libBank: 'BNP Paribas France',
        local: 'PARIS',
        acquirer: 'WORLDLINE',
        acquirerRef: 'WL001',
        codeRejet: 'R001',
        libRejet: 'Transaction non autorisée',
        settlement: 'PENDING'
      },
      {
        refFichier: 'RCB-2024-002',
        dateTraitementRpa: new Date('2024-12-09T09:15:00Z'),
        numAffiliation: 'AFF002',
        libCommercant: 'Tech Solutions Ltd',
        agence: 'AGE002',
        compte: 'CPT002',
        refFacture: 'INV-2024-002',
        cardholder: 'MARTIN MARIE',
        operationCode: 'CB002',
        codeOperation: 'CHBK',
        libCodeOperation: 'Chargeback Reception',
        amountCp: '875.25',
        amountOrigine: '875.25',
        card: '5432****5678',
        processing: 'MASTERCARD',
        transactionDate: new Date('2024-12-07T16:45:00Z'),
        authorization: 'AUTH002',
        issuer: 'CREDIT AGRICOLE',
        libBank: 'Crédit Agricole Centre France',
        local: 'LYON',
        acquirer: 'INGENICO',
        acquirerRef: 'ING002',
        codeRejet: 'R002',
        libRejet: 'Service non rendu',
        settlement: 'PROCESSED'
      },
      {
        refFichier: 'RCB-2024-003',
        dateTraitementRpa: new Date('2024-12-09T10:00:00Z'),
        numAffiliation: 'AFF003',
        libCommercant: 'Fashion Store SAS',
        agence: 'AGE003',
        compte: 'CPT003',
        refFacture: 'INV-2024-003',
        cardholder: 'BERNARD PIERRE',
        operationCode: 'CB003',
        codeOperation: 'CHBK',
        libCodeOperation: 'Chargeback Reception',
        amountCp: '450.00',
        amountOrigine: '450.00',
        card: '4111****9999',
        processing: 'VISA',
        transactionDate: new Date('2024-12-06T11:30:00Z'),
        authorization: 'AUTH003',
        issuer: 'SOCIETE GENERALE',
        libBank: 'Société Générale',
        local: 'MARSEILLE',
        acquirer: 'ATOS',
        acquirerRef: 'AT003',
        codeRejet: 'R003',
        libRejet: 'Produit défectueux',
        settlement: 'PENDING'
      }
    ]).onConflictDoNothing();

    // Sample issued representments
    await db.insert(issuedRepresentments).values([
      {
        refFichier: 'IRE-2024-001',
        dateTraitementRpa: new Date('2024-12-09T11:00:00Z'),
        numAffiliation: 'AFF001',
        libCommercant: 'Commerce Plus SARL',
        agence: 'AGE001',
        compte: 'CPT001',
        refFacture: 'INV-2024-001-REP',
        cardholder: 'DUPONT JEAN',
        operationCode: 'REP001',
        codeOperation: 'REPR',
        libCodeOperation: 'Representment Emission',
        amountCp: '1250.50',
        amountOrigine: '1250.50',
        card: '4567****1234',
        processing: 'VISA',
        transactionDate: new Date('2024-12-08T14:22:00Z'),
        authorization: 'AUTH001',
        issuer: 'BNP PARIBAS',
        local: 'PARIS',
        acquirer: 'WORLDLINE',
        libBank: 'BNP Paribas France',
        acquirerRef: 'WL001',
        codeRepresentation: 'REP001',
        libRepresentation: 'Justificatifs fournis',
        settlement: 'PENDING'
      },
      {
        refFichier: 'IRE-2024-002',
        dateTraitementRpa: new Date('2024-12-09T12:30:00Z'),
        numAffiliation: 'AFF004',
        libCommercant: 'Online Services Inc',
        agence: 'AGE004',
        compte: 'CPT004',
        refFacture: 'INV-2024-004-REP',
        cardholder: 'GARCIA CARLOS',
        operationCode: 'REP002',
        codeOperation: 'REPR',
        libCodeOperation: 'Representment Emission',
        amountCp: '320.75',
        amountOrigine: '320.75',
        card: '5555****4444',
        processing: 'MASTERCARD',
        transactionDate: new Date('2024-12-05T09:15:00Z'),
        authorization: 'AUTH004',
        issuer: 'LCL',
        local: 'TOULOUSE',
        acquirer: 'PAYPAL',
        libBank: 'LCL Banque',
        acquirerRef: 'PP004',
        codeRepresentation: 'REP002',
        libRepresentation: 'Service effectivement rendu',
        settlement: 'APPROVED'
      }
    ]).onConflictDoNothing();

    // Sample issued chargebacks
    await db.insert(issuedChargebacks).values([
      {
        refFichier: 'ICB-2024-001',
        dateTraitementRpa: new Date('2024-12-09T13:15:00Z'),
        numAffiliation: 'AFF005',
        libCommercant: 'Digital Products SARL',
        agence: 'AGE005',
        compte: 'CPT005',
        refFacture: 'INV-2024-005',
        typeCarte: 'VISA CLASSIC',
        cardholder: 'THOMAS SOPHIE',
        operationCode: 'ICB001',
        codeOperation: 'ICHBK',
        libCodeOperation: 'Chargeback Emission',
        amountCp: '680.90',
        amountOrigine: '680.90',
        card: '4000****1111',
        processing: 'VISA',
        transactionDate: new Date('2024-12-04T13:20:00Z'),
        authorization: 'AUTH005',
        issuer: 'HSBC FRANCE',
        local: 'NICE',
        acquirer: 'STRIPE',
        acquirerRef: 'STR005',
        codeRejet: 'IC001',
        libRejet: 'Fraude suspectée',
        settlement: 'PENDING'
      },
      {
        refFichier: 'ICB-2024-002',
        dateTraitementRpa: new Date('2024-12-09T14:00:00Z'),
        numAffiliation: 'AFF006',
        libCommercant: 'Restaurant Le Gourmet',
        agence: 'AGE006',
        compte: 'CPT006',
        refFacture: 'INV-2024-006',
        typeCarte: 'MASTERCARD GOLD',
        cardholder: 'LEROY MICHEL',
        operationCode: 'ICB002',
        codeOperation: 'ICHBK',
        libCodeOperation: 'Chargeback Emission',
        amountCp: '125.40',
        amountOrigine: '125.40',
        card: '5200****7777',
        processing: 'MASTERCARD',
        transactionDate: new Date('2024-12-03T19:45:00Z'),
        authorization: 'AUTH006',
        issuer: 'BANQUE POPULAIRE',
        local: 'BORDEAUX',
        acquirer: 'SQUARE',
        acquirerRef: 'SQ006',
        codeRejet: 'IC002',
        libRejet: 'Service non conforme',
        settlement: 'PROCESSED'
      }
    ]).onConflictDoNothing();

    // Sample received representments
    await db.insert(receivedRepresentments).values([
      {
        refFichier: 'RRE-2024-001',
        dateTraitementRpa: new Date('2024-12-09T15:30:00Z'),
        numAffiliation: 'AFF005',
        libCommercant: 'Digital Products SARL',
        agence: 'AGE005',
        compte: 'CPT005',
        refFacture: 'INV-2024-005-RRP',
        typeCarte: 'VISA CLASSIC',
        cardholder: 'THOMAS SOPHIE',
        operationCode: 'RRE001',
        codeOperation: 'RREPR',
        libCodeOperation: 'Representment Reception',
        amountCp: '680.90',
        amountOrigine: '680.90',
        card: '4000****1111',
        processing: 'VISA',
        transactionDate: new Date('2024-12-04T13:20:00Z'),
        authorization: 'AUTH005',
        issuer: 'HSBC FRANCE',
        local: 'NICE',
        acquirer: 'STRIPE',
        acquirerRef: 'STR005',
        codeRepresentation: 'RRP001',
        libRepresentation: 'Contestation acceptée',
        settlement: 'ACCEPTED'
      }
    ]).onConflictDoNothing();

    console.log('✓ Sample data seeded successfully');
    console.log('✓ Admin user: username=admin, password=admin123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();
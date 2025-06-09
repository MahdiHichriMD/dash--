const { storage } = require('./server/storage.ts');

async function addSampleData() {
  try {
    console.log('Adding sample banking data...');

    // Sample received chargebacks
    const receivedChargebacks = [
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
      }
    ];

    console.log('Sample data ready for database insertion');
    console.log('Admin user credentials: username=admin, password=admin123');
    
  } catch (error) {
    console.error('Error preparing sample data:', error);
  }
}

addSampleData();
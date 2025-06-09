import { db } from './server/db.js';
import { receivedChargebacks, issuedChargebacks, receivedRepresentments, issuedRepresentments } from './shared/schema.js';

// Generate comprehensive sample data for realistic dashboard testing
async function populateComprehensiveData() {
  console.log("🔄 Populating comprehensive sample data...");

  const banks = ['BNP Paribas', 'Crédit Agricole', 'Société Générale', 'BPCE', 'Crédit Mutuel', 'Banque Postale', 'CIC', 'HSBC France'];
  const merchants = ['Amazon France', 'Carrefour', 'Fnac', 'Decathlon', 'Zara', 'IKEA', 'Auchan', 'Leclerc', 'Darty', 'Boulanger'];
  const agencies = ['Paris Opéra', 'Lyon Part-Dieu', 'Marseille Canebière', 'Toulouse Capitole', 'Nice Promenade', 'Bordeaux Centre'];
  const acquirers = ['Worldline', 'Ingenico', 'First Data', 'SIX Payment', 'Global Payments'];

  // Generate data for the last 24 months to show trends
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 24);

  const receivedChargebacksData = [];
  const issuedChargebacksData = [];
  const receivedRepresentmentsData = [];
  const issuedRepresentmentsData = [];

  for (let i = 0; i < 2000; i++) {
    const randomDate = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()));
    const transactionDate = new Date(randomDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const agency = agencies[Math.floor(Math.random() * agencies.length)];
    const acquirer = acquirers[Math.floor(Math.random() * acquirers.length)];
    
    const baseAmount = Math.random() * 5000 + 10; // Between 10 and 5010 EUR
    const amountCp = baseAmount.toFixed(2);
    const amountOrigine = (baseAmount * (0.85 + Math.random() * 0.3)).toFixed(2);

    // Received Chargebacks
    if (i < 500) {
      receivedChargebacksData.push({
        refFichier: `RCB-${randomDate.getFullYear()}-${String(i + 1).padStart(6, '0')}`,
        dateTraitementRpa: randomDate,
        numAffiliation: `AF${Math.floor(Math.random() * 900000) + 100000}`,
        libCommercant: merchant,
        agence: agency,
        compte: `${Math.floor(Math.random() * 90000) + 10000}${Math.floor(Math.random() * 900) + 100}`,
        refFacture: `INV-${Math.floor(Math.random() * 999999)}`,
        cardholder: `${Math.floor(Math.random() * 9000) + 1000}********${Math.floor(Math.random() * 9000) + 1000}`,
        operationCode: 'CB',
        codeOperation: '001',
        libCodeOperation: 'Chargeback Reçu',
        amountCp,
        amountOrigine,
        card: ['VISA', 'MASTERCARD', 'AMEX'][Math.floor(Math.random() * 3)],
        processing: 'PROCESSED',
        transactionDate,
        authorization: `AUTH${Math.floor(Math.random() * 900000) + 100000}`,
        issuer: bank,
        libBank: bank,
        local: 'FR',
        acquirer: acquirer,
        acquirerRef: `ACQ${Math.floor(Math.random() * 900000) + 100000}`,
        codeRejet: ['4855', '4863', '4834', '4840', '4837'][Math.floor(Math.random() * 5)],
        libRejet: ['Marchandise non reçue', 'Fraude carte', 'Transaction dupliquée', 'Autorisation refusée', 'Transaction non reconnue'][Math.floor(Math.random() * 5)],
        settlement: 'PENDING',
        sortEnvoi: 'SENT',
        dateReceptionJustif: Math.random() > 0.3 ? new Date(randomDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        dateDebit: Math.random() > 0.2 ? new Date(randomDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
        annulationCommercant: Math.random() > 0.8
      });
    }

    // Issued Chargebacks
    if (i >= 500 && i < 1000) {
      issuedChargebacksData.push({
        refFichier: `ICB-${randomDate.getFullYear()}-${String(i - 499).padStart(6, '0')}`,
        dateTraitementRpa: randomDate,
        numAffiliation: `AF${Math.floor(Math.random() * 900000) + 100000}`,
        libCommercant: merchant,
        agence: agency,
        compte: `${Math.floor(Math.random() * 90000) + 10000}${Math.floor(Math.random() * 900) + 100}`,
        refFacture: `INV-${Math.floor(Math.random() * 999999)}`,
        typeCarte: ['DEBIT', 'CREDIT', 'PREPAID'][Math.floor(Math.random() * 3)],
        cardholder: `${Math.floor(Math.random() * 9000) + 1000}********${Math.floor(Math.random() * 9000) + 1000}`,
        operationCode: 'CB_OUT',
        codeOperation: '002',
        libCodeOperation: 'Chargeback Émis',
        amountCp,
        amountOrigine,
        card: ['VISA', 'MASTERCARD', 'AMEX'][Math.floor(Math.random() * 3)],
        processing: 'PROCESSED',
        transactionDate,
        authorization: `AUTH${Math.floor(Math.random() * 900000) + 100000}`,
        issuer: bank,
        local: 'FR',
        acquirer: acquirer,
        libBank: bank,
        acquirerRef: `ACQ${Math.floor(Math.random() * 900000) + 100000}`,
        codeRejet: ['4855', '4863', '4834', '4840', '4837'][Math.floor(Math.random() * 5)],
        libRejet: ['Marchandise non reçue', 'Fraude carte', 'Transaction dupliquée', 'Autorisation refusée', 'Transaction non reconnue'][Math.floor(Math.random() * 5)],
        settlement: 'COMPLETED',
        annulationCommercant: Math.random() > 0.85
      });
    }

    // Received Representments
    if (i >= 1000 && i < 1500) {
      receivedRepresentmentsData.push({
        refFichier: `RRE-${randomDate.getFullYear()}-${String(i - 999).padStart(6, '0')}`,
        dateTraitementRpa: randomDate,
        numAffiliation: `AF${Math.floor(Math.random() * 900000) + 100000}`,
        libCommercant: merchant,
        agence: agency,
        compte: `${Math.floor(Math.random() * 90000) + 10000}${Math.floor(Math.random() * 900) + 100}`,
        refFacture: `INV-${Math.floor(Math.random() * 999999)}`,
        cardholder: `${Math.floor(Math.random() * 9000) + 1000}********${Math.floor(Math.random() * 9000) + 1000}`,
        operationCode: 'REP_IN',
        codeOperation: '003',
        libCodeOperation: 'Représentation Reçue',
        amountCp,
        amountOrigine,
        card: ['VISA', 'MASTERCARD', 'AMEX'][Math.floor(Math.random() * 3)],
        processing: 'PROCESSED',
        transactionDate,
        authorization: `AUTH${Math.floor(Math.random() * 900000) + 100000}`,
        issuer: bank,
        local: 'FR',
        acquirer: acquirer,
        libBank: bank,
        acquirerRef: `ACQ${Math.floor(Math.random() * 900000) + 100000}`,
        codeRepresentation: ['REP01', 'REP02', 'REP03'][Math.floor(Math.random() * 3)],
        libRepresentation: ['Justificatif fourni', 'Preuve de livraison', 'Autorisation valide'][Math.floor(Math.random() * 3)],
        settlement: 'PENDING',
        annulationCommercant: Math.random() > 0.9
      });
    }

    // Issued Representments
    if (i >= 1500) {
      issuedRepresentmentsData.push({
        refFichier: `IRE-${randomDate.getFullYear()}-${String(i - 1499).padStart(6, '0')}`,
        dateTraitementRpa: randomDate,
        numAffiliation: `AF${Math.floor(Math.random() * 900000) + 100000}`,
        libCommercant: merchant,
        agence: agency,
        compte: `${Math.floor(Math.random() * 90000) + 10000}${Math.floor(Math.random() * 900) + 100}`,
        refFacture: `INV-${Math.floor(Math.random() * 999999)}`,
        cardholder: `${Math.floor(Math.random() * 9000) + 1000}********${Math.floor(Math.random() * 9000) + 1000}`,
        operationCode: 'REP_OUT',
        codeOperation: '004',
        libCodeOperation: 'Représentation Émise',
        amountCp,
        amountOrigine,
        card: ['VISA', 'MASTERCARD', 'AMEX'][Math.floor(Math.random() * 3)],
        processing: 'PROCESSED',
        transactionDate,
        authorization: `AUTH${Math.floor(Math.random() * 900000) + 100000}`,
        issuer: bank,
        local: 'FR',
        acquirer: acquirer,
        libBank: bank,
        acquirerRef: `ACQ${Math.floor(Math.random() * 900000) + 100000}`,
        codeRepresentation: ['REP01', 'REP02', 'REP03'][Math.floor(Math.random() * 3)],
        libRepresentation: ['Justificatif fourni', 'Preuve de livraison', 'Autorisation valide'][Math.floor(Math.random() * 3)],
        settlement: 'COMPLETED',
        annulationCommercant: Math.random() > 0.9
      });
    }
  }

  try {
    // Insert data in batches
    console.log("📥 Inserting received chargebacks...");
    if (receivedChargebacksData.length > 0) {
      await db.insert(receivedChargebacks).values(receivedChargebacksData);
    }

    console.log("📤 Inserting issued chargebacks...");
    if (issuedChargebacksData.length > 0) {
      await db.insert(issuedChargebacks).values(issuedChargebacksData);
    }

    console.log("📥 Inserting received representments...");
    if (receivedRepresentmentsData.length > 0) {
      await db.insert(receivedRepresentments).values(receivedRepresentmentsData);
    }

    console.log("📤 Inserting issued representments...");
    if (issuedRepresentmentsData.length > 0) {
      await db.insert(issuedRepresentments).values(issuedRepresentmentsData);
    }

    console.log(`✅ Successfully populated:
    - ${receivedChargebacksData.length} received chargebacks
    - ${issuedChargebacksData.length} issued chargebacks  
    - ${receivedRepresentmentsData.length} received representments
    - ${issuedRepresentmentsData.length} issued representments
    
    Total: ${receivedChargebacksData.length + issuedChargebacksData.length + receivedRepresentmentsData.length + issuedRepresentmentsData.length} records`);

  } catch (error) {
    console.error("❌ Error populating data:", error);
    throw error;
  }
}

// Run the population
populateComprehensiveData()
  .then(() => {
    console.log("🎉 Database population completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Population failed:", error);
    process.exit(1);
  });
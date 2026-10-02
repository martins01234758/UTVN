import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UniversalTransaction, AuditLogEntry } from '../types/utvn';

const TRANSACTIONS_COLLECTION = 'transactions';
const AUDIT_LOGS_COLLECTION = 'audit_logs';

/**
 * Save or update a Universal Transaction in Firestore
 */
export async function saveTransactionToFirestore(transaction: UniversalTransaction): Promise<void> {
  const path = `${TRANSACTIONS_COLLECTION}/${transaction.utid}`;
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transaction.utid);
    await setDoc(docRef, {
      ...transaction,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Batch seed/sync transactions to Firestore
 */
export async function seedTransactionsToFirestore(transactions: UniversalTransaction[]): Promise<number> {
  let count = 0;
  for (const txn of transactions) {
    try {
      await saveTransactionToFirestore(txn);
      count++;
    } catch (err) {
      console.warn(`Failed to seed transaction ${txn.utid}:`, err);
    }
  }
  return count;
}

/**
 * Fetch all Universal Transactions from Firestore
 */
export async function fetchTransactionsFromFirestore(): Promise<UniversalTransaction[]> {
  try {
    const querySnapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    const txns: UniversalTransaction[] = [];
    querySnapshot.forEach((d) => {
      txns.push(d.data() as UniversalTransaction);
    });
    return txns;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, TRANSACTIONS_COLLECTION);
  }
}

/**
 * Subscribe to real-time transaction updates from Firestore
 */
export function subscribeToTransactions(
  onUpdate: (transactions: UniversalTransaction[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, TRANSACTIONS_COLLECTION), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: UniversalTransaction[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as UniversalTransaction);
      });
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, TRANSACTIONS_COLLECTION);
      } catch (e) {
        if (onError) onError(e as Error);
      }
    }
  );
}

/**
 * Record an immutable audit log entry in Firestore
 */
export async function recordAuditLogInFirestore(logEntry: AuditLogEntry): Promise<void> {
  const path = `${AUDIT_LOGS_COLLECTION}/${logEntry.id}`;
  try {
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, logEntry.id);
    await setDoc(docRef, logEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
